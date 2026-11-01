using backend.Data;
using backend.Hubs;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient("HealthProbe", client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("CloudPulse/1.0");
});

builder.Services.AddHostedService<EndpointHealthWorker>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    if (!await db.MonitoredEndpoints.AnyAsync())
    {
        db.MonitoredEndpoints.AddRange(
            new MonitoredEndpoint { Name = "Google Public DNS", Url = "https://dns.google" },
            new MonitoredEndpoint { Name = "GitHub API Status", Url = "https://api.github.com" });
        await db.SaveChangesAsync();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.MapControllers();
app.MapHub<MetricsHub>("/hubs/metrics");

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "CloudPulse" }))
    .WithName("GetHealth");

app.Run();
