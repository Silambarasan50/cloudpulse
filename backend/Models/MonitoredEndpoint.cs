namespace backend.Models;

public class MonitoredEndpoint
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int CheckIntervalSeconds { get; set; } = 30;
    public int ExpectedStatusCode { get; set; } = 200;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<HealthCheckLog> HealthCheckLogs { get; set; } = new List<HealthCheckLog>();
}
