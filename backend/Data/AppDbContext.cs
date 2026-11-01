using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<MonitoredEndpoint> MonitoredEndpoints => Set<MonitoredEndpoint>();
    public DbSet<HealthCheckLog> HealthCheckLogs => Set<HealthCheckLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MonitoredEndpoint>(entity =>
        {
            entity.Property(e => e.CheckIntervalSeconds).HasDefaultValue(30);
            entity.Property(e => e.ExpectedStatusCode).HasDefaultValue(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<HealthCheckLog>(entity =>
        {
            entity.HasOne(l => l.Endpoint)
                .WithMany(e => e.HealthCheckLogs)
                .HasForeignKey(l => l.EndpointId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
