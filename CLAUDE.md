# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Student Dashboard — a full-stack web app for managing student tasks. React frontend communicates with an ASP.NET Core REST API backed by SQL Server (LocalDB).

## Commands

### Frontend (`student-dashboard-client/`)

```bash
npm run dev       # Dev server with HMR at http://localhost:5173
npm run build     # Production build to dist/
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`Backend/StudentDashboard.API/`)

```bash
dotnet run        # Start API at https://localhost:7137 (Swagger at /swagger)
dotnet build
dotnet ef migrations add <Name>   # Add EF Core migration
dotnet ef database update         # Apply migrations to LocalDB
```

## Architecture

**Frontend:** React 19 + Vite + Tailwind CSS 4 + Axios. Single-component app in `App.jsx` with bilingual (English/Hebrew) support and RTL layout. API base URL is hardcoded to `https://localhost:7137/api/Tasks`.

**Backend:** ASP.NET Core 8 Web API — `TasksController.cs` exposes CRUD endpoints at `/api/Tasks`. `DashboardContext.cs` is the EF Core DbContext. Database is SQL Server LocalDB (`StudentDashboardDB`). CORS is configured to allow the React frontend.

**Data model:** `StudentTask` — `Id`, `Title`, `Description`, `DueDate`, `IsCompleted`.

**`ScheduleItem.cs`** is a placeholder model not yet wired to any controller or DbSet.
