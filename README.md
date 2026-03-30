# Smart Student Dashboard

A full-stack web application for managing academic tasks, schedules, and student productivity. Built with a modern tech stack, leveraging AI-assisted development tools throughout the entire product lifecycle — from initial concept to implementation.

## Features

- **Task Management** — Create, update, and track academic tasks with real-time status updates
- **Schedule Management** — Full weekly schedule view with course details, times, and locations
- **Responsive UI** — Clean, mobile-friendly interface with bilingual support (English/Hebrew) and RTL layout
- **RESTful API** — 20+ endpoints with full CRUD operations across multiple domains

## Tech Stack

### Frontend
- **React 19** with Hooks and State Management
- **Vite** — Fast build tool and dev server
- **Tailwind CSS 4** — Utility-first responsive styling
- **Axios** — HTTP client for API communication
- **JavaScript (ES6+)**

### Backend
- **ASP.NET Core 8 Web API** — RESTful API architecture
- **Entity Framework Core** — ORM with code-first migrations
- **SQL Server (LocalDB)** — Relational database

### Development Tools
- **Git** — Version control
- **Swagger / OpenAPI** — API documentation and testing
- **AI-Assisted Development** — ChatGPT and Claude used for code generation, debugging, and design decisions

## Getting Started

### Backend
```bash
cd Backend/StudentDashboard.API
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd student-dashboard-client
npm install
npm run dev
```
