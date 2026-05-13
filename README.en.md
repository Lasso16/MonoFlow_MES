**English** | [Español](./README.md)

# MonoFlow MES

Manufacturing Execution System (MES) for managing production orders, operators, operations, and shop floor work logging.

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | React 18 + Vite + TypeScript + MUI |
| API      | .NET 10 (C#) - Clean Architecture  |
| Database | PostgreSQL 16                      |
| Server   | Nginx (frontend), Kestrel (API)    |
| ORM      | Entity Framework Core + Npgsql     |
| Container| Docker + Docker Compose            |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Engine and Docker Compose)
- Minimum 4 GB RAM allocated to Docker
- Free ports: 80, 5000, 5432

No local .NET or Node installation required to run the application.

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd MonoFlow_MES

# Start all services
docker-compose --env-file .env.docker up -d --build
```

First run: 4-6 minutes (image build + migrations + seeds).
Subsequent runs: 1-2 minutes (cached images).

## Application Access

| Service    | URL                               |
|------------|-----------------------------------|
| Frontend   | http://localhost                  |
| API        | http://localhost:5000             |
| Swagger    | http://localhost:5000/swagger     |
| Health     | http://localhost:5000/health      |
| PostgreSQL | localhost:5432                    |

## Default Credentials

| Service    | User     | Password | Database     |
|------------|----------|----------|--------------|
| PostgreSQL | postgres | postgres | monoflow_dev |

Configurable in `.env.docker`.

## Project Structure

```
MonoFlow_MES/
+-- docker-compose.yml          # Docker orchestration
+-- .env.docker                 # Docker environment variables
+-- .env                        # Environment variables (same as .env.docker)
|
+-- backend/
|   +-- Dockerfile
|   +-- seed_data.sql           # Initial data (operators, orders, etc.)
|   +-- MonoFlow.api/           # Entry point, controllers, middlewares
|   +-- MonoFlow.application/   # CQRS, commands, queries, handlers (MediatR)
|   +-- MonoFlow.domain/        # Entities, aggregates, domain events
|   `-- MonoFlow.infrastructure/# DbContext, EF Core migrations, repositories
|
`-- frontend/
    +-- Dockerfile
    +-- src/
    |   +-- pages/              # Pages (Terminal, Orders, etc.)
    |   +-- components/         # Reusable components
    |   +-- api/                # Query hooks (React Query)
    |   `-- ...
    +-- nginx.conf
    `-- vite.config.ts
```

## API Architecture

The API follows Clean Architecture with four layers:

- **domain**: entities, value objects, aggregates, domain events. No external dependencies.
- **application**: use cases via CQRS (MediatR), interfaces, validators.
- **infrastructure**: persistence implementation (EF Core + PostgreSQL), repositories, outbox.
- **api**: REST controllers, middlewares, background services, configuration.

## Docker Initialization Flow

1. **PostgreSQL** starts and creates the `monoflow_dev` database
2. **API** connects to PostgreSQL and runs EF Core migrations automatically
3. **Seeds service** waits for the API and loads initial data via `seed_data.sql`
4. **Frontend** builds with Nginx and connects to the API

## Initial Data (Seeds)

The `backend/seed_data.sql` file loads on first run:

- 100 operators
- 2 operation types
- 8 production orders with associated items and operations

Seeds use `ON CONFLICT DO NOTHING` and are idempotent.

## Management Commands

```bash
# Start
docker-compose --env-file .env.docker up -d --build

# Check container status
docker-compose ps

# Live logs
docker-compose logs -f

# Connect to database
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev

# Rebuild only the API (after backend changes)
docker-compose build --no-cache api

# Stop (keep data)
docker-compose down

# Stop and delete all data
docker-compose down -v
```

## Local Development (without Docker)

Requirements:

- .NET 10 SDK
- Node 20 + npm
- PostgreSQL 16 running locally

### Backend

```bash
cd backend
dotnet restore
dotnet ef database update --project MonoFlow.infrastructure
dotnet run --project MonoFlow.api
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` to point at the local API.

## Additional Documentation

- [DOCKER_README.md](./DOCKER_README.md) - Docker quick guide
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Detailed setup, troubleshooting, configuration
- [DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md) - Docker architecture diagram
- [frontend/docs/TerminalPage.md](./frontend/docs/TerminalPage.md) - Terminal page documentation
