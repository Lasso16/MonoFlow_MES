# MonoFlow MES

Sistema de Ejecucion de Manufactura (MES) para gestion de ordenes de produccion, operarios, operaciones y registro de trabajo en planta.

## Stack tecnologico

| Capa       | Tecnologia                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + TypeScript + MUI |
| API        | .NET 10 (C#) - Clean Architecture  |
| Base datos | PostgreSQL 16                      |
| Servidor   | Nginx (frontend), Kestrel (API)    |
| ORM        | Entity Framework Core + Npgsql     |
| Contenedor | Docker + Docker Compose            |

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Engine y Docker Compose)
- Minimo 4 GB de RAM asignados a Docker
- Puertos libres: 80, 5000, 5432

No se requiere .NET ni Node instalados localmente para ejecutar la aplicacion.

## Inicio rapido

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd MonoFlow_MES

# Levantar todos los servicios
docker-compose --env-file .env.docker up -d --build
```

Primera ejecucion: 4-6 minutos (build de imagenes + migraciones + seeds).
Ejecuciones siguientes: 1-2 minutos (imagenes cacheadas).

## Acceso a la aplicacion

| Servicio   | URL                               |
|------------|-----------------------------------|
| Frontend   | http://localhost                  |
| API        | http://localhost:5000             |
| Swagger    | http://localhost:5000/swagger     |
| Health     | http://localhost:5000/health      |
| PostgreSQL | localhost:5432                    |

## Credenciales por defecto

| Servicio   | Usuario  | Password | Base de datos |
|------------|----------|----------|---------------|
| PostgreSQL | postgres | postgres | monoflow_dev  |

Modificables en `.env.docker`.

## Estructura del proyecto

```
MonoFlow_MES/
+-- docker-compose.yml          # Orquestacion Docker
+-- .env.docker                 # Variables de entorno para Docker
+-- .env                        # Variables de entorno (identico a .env.docker)
|
+-- backend/
|   +-- Dockerfile
|   +-- seed_data.sql           # Datos iniciales (operarios, ordenes, etc.)
|   +-- MonoFlow.api/           # Punto de entrada, controllers, middlewares
|   +-- MonoFlow.application/   # CQRS, commands, queries, handlers (MediatR)
|   +-- MonoFlow.domain/        # Entidades, agregados, eventos de dominio
|   `-- MonoFlow.infrastructure/# DbContext, migraciones EF Core, repositorios
|
`-- frontend/
    +-- Dockerfile
    +-- src/
    |   +-- pages/              # Paginas (Terminal, Ordenes, etc.)
    |   +-- components/         # Componentes reutilizables
    |   +-- api/                # Hooks de queries (React Query)
    |   `-- ...
    +-- nginx.conf
    `-- vite.config.ts
```

## Arquitectura de la API

La API sigue Clean Architecture con cuatro capas:

- **domain**: entidades, value objects, agregados, eventos de dominio. Sin dependencias externas.
- **application**: casos de uso via CQRS (MediatR), interfaces, validadores.
- **infrastructure**: implementacion de persistencia (EF Core + PostgreSQL), repositorios, outbox.
- **api**: controllers REST, middlewares, background services, configuracion.

## Flujo de inicializacion Docker

1. **PostgreSQL** arranca y crea la BD `monoflow_dev`
2. **API** conecta a PostgreSQL y ejecuta migraciones EF Core automaticamente
3. **Seeds service** espera al API y carga datos iniciales via `seed_data.sql`
4. **Frontend** se construye con Nginx y conecta al API

## Datos iniciales (seeds)

El archivo `backend/seed_data.sql` carga al primer inicio:

- 100 operarios
- 2 tipos de operacion
- 8 ordenes de produccion con articulos y operaciones asociadas

Los seeds usan `ON CONFLICT DO NOTHING` y son idempotentes.

## Comandos de gestion

```bash
# Iniciar
docker-compose --env-file .env.docker up -d --build

# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Conectar a la base de datos
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev

# Reconstruir solo el API (tras cambios en backend)
docker-compose build --no-cache api

# Parar (mantener datos)
docker-compose down

# Parar y eliminar todos los datos
docker-compose down -v
```

## Desarrollo local (sin Docker)

Para desarrollo local se necesita:

- .NET 10 SDK
- Node 20 + npm
- PostgreSQL 16 corriendo localmente

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

La variable `VITE_API_URL` en `frontend/.env` debe apuntar al API local.

## Documentacion adicional

- [DOCKER_README.md](./DOCKER_README.md) - Guia rapida Docker
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Setup detallado, troubleshooting, configuracion
- [DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md) - Diagrama de arquitectura Docker
- [frontend/docs/TerminalPage.md](./frontend/docs/TerminalPage.md) - Documentacion pagina Terminal
