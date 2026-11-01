using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MonitoredEndpoints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Url = table.Column<string>(type: "TEXT", nullable: false),
                    CheckIntervalSeconds = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 30),
                    ExpectedStatusCode = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 200),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonitoredEndpoints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HealthCheckLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EndpointId = table.Column<int>(type: "INTEGER", nullable: false),
                    StatusCode = table.Column<int>(type: "INTEGER", nullable: false),
                    ResponseTimeMs = table.Column<double>(type: "REAL", nullable: false),
                    IsSuccess = table.Column<bool>(type: "INTEGER", nullable: false),
                    CheckedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthCheckLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HealthCheckLogs_MonitoredEndpoints_EndpointId",
                        column: x => x.EndpointId,
                        principalTable: "MonitoredEndpoints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HealthCheckLogs_EndpointId",
                table: "HealthCheckLogs",
                column: "EndpointId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HealthCheckLogs");

            migrationBuilder.DropTable(
                name: "MonitoredEndpoints");
        }
    }
}
