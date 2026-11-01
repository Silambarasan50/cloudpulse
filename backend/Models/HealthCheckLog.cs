namespace backend.Models;

public class HealthCheckLog
{
    public int Id { get; set; }
    public int EndpointId { get; set; }
    public int StatusCode { get; set; }
    public double ResponseTimeMs { get; set; }
    public bool IsSuccess { get; set; }
    public DateTime CheckedAtUtc { get; set; }

    public MonitoredEndpoint Endpoint { get; set; } = null!;
}
