using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public record EndpointSummaryDto(
    int Id,
    string Name,
    string Url,
    int CheckIntervalSeconds,
    int ExpectedStatusCode,
    bool IsActive,
    DateTime CreatedAtUtc,
    int? LastStatusCode,
    bool? LastIsSuccess,
    double? LastResponseTimeMs,
    DateTime? LastCheckedAtUtc,
    double? AvgResponseTimeMs24h,
    int CheckCount24h);

public record EndpointDetailDto(
    int Id,
    string Name,
    string Url,
    int CheckIntervalSeconds,
    int ExpectedStatusCode,
    bool IsActive,
    DateTime CreatedAtUtc,
    IReadOnlyList<HealthCheckLogDto> RecentLogs);

public record HealthCheckLogDto(
    int Id,
    int StatusCode,
    double ResponseTimeMs,
    bool IsSuccess,
    DateTime CheckedAtUtc);

public class CreateEndpointRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, Url, MaxLength(2000)]
    public string Url { get; set; } = string.Empty;

    [Range(5, 86400)]
    public int CheckIntervalSeconds { get; set; } = 30;

    [Range(100, 599)]
    public int ExpectedStatusCode { get; set; } = 200;
}

public class UpdateEndpointRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [Url, MaxLength(2000)]
    public string? Url { get; set; }

    [Range(5, 86400)]
    public int? CheckIntervalSeconds { get; set; }

    [Range(100, 599)]
    public int? ExpectedStatusCode { get; set; }

    public bool? IsActive { get; set; }
}
