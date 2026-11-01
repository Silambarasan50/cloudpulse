using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/endpoints")]
public class EndpointsController(AppDbContext db) : ControllerBase
{
    private const int RecentLogCount = 50;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EndpointSummaryDto>>> GetAll(
        CancellationToken ct)
    {
        var endpoints = await db.MonitoredEndpoints
            .AsNoTracking()
            .OrderBy(e => e.Name)
            .ToListAsync(ct);

        var since = DateTime.UtcNow.AddHours(-24);
        var logs = await db.HealthCheckLogs
            .AsNoTracking()
            .Where(l => l.CheckedAtUtc >= since)
            .ToListAsync(ct);

        var logsByEndpoint = logs
            .GroupBy(l => l.EndpointId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(l => l.CheckedAtUtc).ToList());

        var summaries = endpoints.Select(e =>
        {
            logsByEndpoint.TryGetValue(e.Id, out var list);
            var latest = list?.FirstOrDefault();
            return new EndpointSummaryDto(
                e.Id,
                e.Name,
                e.Url,
                e.CheckIntervalSeconds,
                e.ExpectedStatusCode,
                e.IsActive,
                e.CreatedAtUtc,
                latest?.StatusCode,
                latest?.IsSuccess,
                latest?.ResponseTimeMs,
                latest?.CheckedAtUtc,
                list is { Count: > 0 } ? list.Average(l => l.ResponseTimeMs) : null,
                list?.Count ?? 0);
        }).ToList();

        return Ok(summaries);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EndpointDetailDto>> GetById(int id, CancellationToken ct)
    {
        var endpoint = await db.MonitoredEndpoints
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, ct);

        if (endpoint is null)
        {
            return NotFound();
        }

        var recentLogs = await db.HealthCheckLogs
            .AsNoTracking()
            .Where(l => l.EndpointId == id)
            .OrderByDescending(l => l.CheckedAtUtc)
            .Take(RecentLogCount)
            .Select(l => new HealthCheckLogDto(
                l.Id, l.StatusCode, l.ResponseTimeMs, l.IsSuccess, l.CheckedAtUtc))
            .ToListAsync(ct);

        return Ok(new EndpointDetailDto(
            endpoint.Id,
            endpoint.Name,
            endpoint.Url,
            endpoint.CheckIntervalSeconds,
            endpoint.ExpectedStatusCode,
            endpoint.IsActive,
            endpoint.CreatedAtUtc,
            recentLogs));
    }

    [HttpPost]
    public async Task<ActionResult<EndpointSummaryDto>> Create(
        CreateEndpointRequest request, CancellationToken ct)
    {
        var endpoint = new MonitoredEndpoint
        {
            Name = request.Name,
            Url = request.Url,
            CheckIntervalSeconds = request.CheckIntervalSeconds,
            ExpectedStatusCode = request.ExpectedStatusCode,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
        };

        db.MonitoredEndpoints.Add(endpoint);
        await db.SaveChangesAsync(ct);

        var summary = new EndpointSummaryDto(
            endpoint.Id,
            endpoint.Name,
            endpoint.Url,
            endpoint.CheckIntervalSeconds,
            endpoint.ExpectedStatusCode,
            endpoint.IsActive,
            endpoint.CreatedAtUtc,
            null, null, null, null, null, 0);

        return CreatedAtAction(nameof(GetById), new { id = endpoint.Id }, summary);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id, UpdateEndpointRequest request, CancellationToken ct)
    {
        var endpoint = await db.MonitoredEndpoints.FirstOrDefaultAsync(e => e.Id == id, ct);

        if (endpoint is null)
        {
            return NotFound();
        }

        if (request.Name is not null) endpoint.Name = request.Name;
        if (request.Url is not null) endpoint.Url = request.Url;
        if (request.CheckIntervalSeconds is { } interval) endpoint.CheckIntervalSeconds = interval;
        if (request.ExpectedStatusCode is { } statusCode) endpoint.ExpectedStatusCode = statusCode;
        if (request.IsActive is { } isActive) endpoint.IsActive = isActive;

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var endpoint = await db.MonitoredEndpoints.FirstOrDefaultAsync(e => e.Id == id, ct);

        if (endpoint is null)
        {
            return NotFound();
        }

        db.MonitoredEndpoints.Remove(endpoint);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
