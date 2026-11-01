# CloudPulse

Real-time microservice health & observability platform.

## Structure

- `backend/` — ASP.NET Core 9 Web API with EF Core + SQLite
- `frontend/` — React SPA (Vite + Tailwind CSS + Lucide React + Axios)

## Run locally

Backend (http://localhost:5287):

```bash
cd backend
dotnet run
```

Frontend (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

SQLite (`backend/cloudpulse.db`) requires zero setup — the schema is managed via EF Core migrations (`dotnet ef database update` to recreate if deleted).
