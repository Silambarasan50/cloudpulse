# CloudPulse

Real-time microservice health & observability platform.

## Structure

- `backend/` — ASP.NET Core 10 Web API with EF Core + SQL Server
- `frontend/` — React SPA (Vite + Tailwind CSS + Lucide React + Axios)

## Prerequisites

- .NET SDK 10
- Node.js 20+
- SQL Server (local instance, e.g. `localhost` / SSMS)

## Run locally

Backend (http://localhost:5287):

```bash
cd backend
dotnet ef database update   # creates the CloudPulse database
dotnet run
```

Frontend (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

The backend connects to SQL Server via Windows authentication
(`Server=localhost;Database=CloudPulse;Trusted_Connection=True;TrustServerCertificate=True`).
Edit `backend/appsettings.json` to point at a different instance.
