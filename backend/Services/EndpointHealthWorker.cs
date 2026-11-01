using System.Collections.Concurrent;
using System.Diagnostics;
using backend.Data;
using backend.Dtos;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class EndpointHealthWorker(
    IServiceScopeFactory scopeFactory,
    IHttpClientFactory httpClientFactory,
    IHubContext<MetricsHub> hubContext,
    ILogger<EndpointHealthWorker> logger) : BackgroundService
{
    private static readonly TimeSpan SweepInterval = TimeSpan.FromSeconds(5);

    private readonly ConcurrentDictionary<int, DateTime> _lastCheckedUtc = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunSweepAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Health probe sweep failed");
            }

            try
            {
                await Task.Delay(SweepInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task RunSweepAsync(CancellationToken stoppingToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var endpoints = await db.MonitoredEndpoints
            .AsNoTracking()
            .Where(e => e.IsActive)
            .ToListAsync(stoppingToken);

        var now = DateTime.UtcNow;
        var due = endpoints
            .Where(e => !_lastCheckedUtc.TryGetValue(e.Id, out var last)
                || now - last >= TimeSpan.FromSeconds(e.CheckIntervalSeconds))
            .ToList();

        if (due.Count == 0)
        {
            return;
        }

        var results = await Task.WhenAll(due.Select(e => ProbeAsync(e, stoppingToken)));

        foreach (var result in results)
        {
            _lastCheckedUtc[result.Log.EndpointId] = now;

            db.HealthCheckLogs.Add(result.Log);
            await db.SaveChangesAsync(stoppingToken);

            await hubContext.Clients.All
                .SendAsync("ReceiveMetricUpdate", result.Broadcast, stoppingToken);
        }
    }

    private async Task<ProbeResult> ProbeAsync(
        MonitoredEndpoint endpoint, CancellationToken stoppingToken)
    {
        var client = httpClientFactory.CreateClient("HealthProbe");
        var stopwatch = Stopwatch.StartNew();
        int statusCode;
        bool isSuccess;

        try
        {
            using var response = await client.GetAsync(
                endpoint.Url, HttpCompletionOption.ResponseHeadersRead, stoppingToken);
            statusCode = (int)response.StatusCode;
            isSuccess = statusCode == endpoint.ExpectedStatusCode
                || statusCode is >= 200 and <= 299;
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Probe to {Url} failed", endpoint.Url);
            statusCode = 0;
            isSuccess = false;
        }

        stopwatch.Stop();
        var checkedAtUtc = DateTime.UtcNow;

        var log = new HealthCheckLog
        {
            EndpointId = endpoint.Id,
            StatusCode = statusCode,
            ResponseTimeMs = stopwatch.Elapsed.TotalMilliseconds,
            IsSuccess = isSuccess,
            CheckedAtUtc = checkedAtUtc,
        };

        var broadcast = new MetricBroadcastDto(
            endpoint.Id,
            endpoint.Name,
            endpoint.Url,
            statusCode,
            log.ResponseTimeMs,
            isSuccess,
            checkedAtUtc);

        return new ProbeResult(log, broadcast);
    }

    private sealed record ProbeResult(HealthCheckLog Log, MetricBroadcastDto Broadcast);
}
