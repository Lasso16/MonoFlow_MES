# Arquitectura Docker - MonoFlow MES

```
+--------------------------------------------------------------+
|                     Docker Network                           |
|              (monoflow-network - bridge)                     |
|                                                              |
|  +------------------+  +------------------+  +------------+ |
|  |   PostgreSQL 16  |  |   API (.NET 10)  |  | Frontend   | |
|  |   alpine         |  |   Puerto 5000    |  | Puerto 80  | |
|  |                  |  |                  |  |            | |
|  |  Puerto: 5432    |  | Health Check:    |  | Nginx      | |
|  |  User: postgres  |  | /health          |  |            | |
|  |  BD: monoflow_dev|  |                  |  | React App  | |
|  |                  |  | Migraciones EF   |  |            | |
|  |  Volume:         |  | Core automaticas |  | Conecta a: | |
|  |  postgres_data   |  |                  |  | api:5000   | |
|  |  (persistente)   |  | Restart:         |  |            | |
|  |                  |  | on-failure       |  |            | |
|  +--------^---------+  +--------+---------+  +------+-----+ |
|           |                     |                   |        |
|           |                     +-------------------+        |
|           |                                                   |
|  +--------+--------------------------------------------------+|
|  |       Seeds Service (ejecuta una sola vez)               ||
|  |                                                          ||
|  | - Espera a que API este healthy                         ||
|  | - Ejecuta seed_data.sql                                 ||
|  |   - 100 operarios                                       ||
|  |   - 2 tipos de operacion                                ||
|  |   - 8 ordenes con articulos y operaciones               ||
|  | - Se detiene al terminar                                ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+

         Host Machine

+--------------------------------------------------------------+
|                                                              |
|  http://localhost          -> Frontend (Nginx)              |
|  http://localhost:5000     -> API (.NET)                    |
|  http://localhost:5000/swagger -> Swagger UI                |
|  localhost:5432            -> PostgreSQL                    |
|                                                              |
+--------------------------------------------------------------+
```

## Flujo de inicializacion

```
[START]
  |
[PostgreSQL inicia]
  |- Espera hasta 20 segundos para aceptar conexiones
  |- Crea la base de datos monoflow_dev
  `- Responde a health checks (pg_isready)
  |
[API inicia cuando PostgreSQL esta healthy]
  |- Carga variables desde .env.docker
  |- Conecta a PostgreSQL via Npgsql
  |- Ejecuta EF Core Migrations:
  |   |- Crea tablas: operarios, ordenes, articulos
  |   |- Crea tablas: operaciones, tipos_operacion
  |   `- Resto de tablas segun migraciones
  |- API inicia en puerto 5000
  `- Responde a health checks en /health
  |
[Seeds Service espera a que API este healthy]
  |- Maximo: 120 intentos (2 minutos)
  |- Intervalo: 1 segundo entre intentos
  |- Espera 10 segundos adicionales tras detectar API
  `- Si no conecta, falla y se reinicia
  |
[Seeds Service ejecuta seed_data.sql via psql]
  |- INSERT 100 operarios (generate_series)
  |- INSERT 2 tipos de operacion
  |- INSERT 8 ordenes
  |- INSERT articulos por orden
  `- INSERT operaciones por articulo
  |
[Frontend inicia]
  |- Build: Node 20 + npm ci
  |- Build: Nginx alpine
  |- VITE_API_URL=http://localhost:5000 inyectado en build
  `- Nginx proxy reverso hacia api:5000
  |
[LISTO]
  |- Frontend: http://localhost
  |- API: http://localhost:5000
  |- Swagger: http://localhost:5000/swagger
  `- BD: localhost:5432 (user: postgres)
```

## Configuracion de servicios

### PostgreSQL
```
Imagen:    postgres:16-alpine
Puerto:    5432
Usuario:   postgres (via .env.docker)
Password:  postgres (via .env.docker)
BD:        monoflow_dev
Volumen:   postgres_data -> /var/lib/postgresql/data
Healthcheck: pg_isready
```

### API (.NET 10)
```
Framework: .NET 10
Build:     mcr.microsoft.com/dotnet/sdk:10.0
Runtime:   mcr.microsoft.com/dotnet/aspnet:10.0
Puerto:    5000
Entorno:   Docker
Healthcheck: GET /health
Restart:   on-failure
```

### Seeds
```
Imagen:    postgres:16-alpine (usa psql)
Espera:    API healthy + 10 segundos adicionales
Script:    backend/seed_data.sql
Restart:   on-failure
```

### Frontend
```
Build:     node:20-alpine + nginx:alpine
Puerto:    80
Servidor:  Nginx con proxy reverso
Build arg: VITE_API_URL=http://localhost:5000
```

## Variables de entorno (.env.docker)

```env
DB_USER=postgres               # Usuario PostgreSQL
DB_PASSWORD=postgres           # Password PostgreSQL
DB_NAME=monoflow_dev           # Nombre de base de datos
ASPNETCORE_ENVIRONMENT=Docker  # Entorno .NET
ASPNETCORE_URLS=http://+:5000  # URLs API
VITE_API_URL=http://localhost:5000  # Endpoint API para frontend
```

## Estructura base de datos

```
Base de datos: monoflow_dev (PostgreSQL)

Tablas (creadas por EF Core Migrations):
  operarios       (100 registros via seed)
  ordenes         (8 registros via seed)
  articulos       (por orden)
  operaciones     (por articulo)
  tipos_operacion (2 registros via seed)
  ... (resto segun modelo de dominio)

Volumen: postgres_data -> /var/lib/postgresql/data
```

## Comandos clave

```bash
# Iniciar
docker-compose --env-file .env.docker up -d --build

# Estado
docker-compose ps

# Logs
docker-compose logs -f

# Conectar a BD
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev

# Parar
docker-compose down

# Limpiar todo (incluida BD)
docker-compose down -v
```

## Tiempos esperados

```
Primera ejecucion:
  PostgreSQL healthcheck:     10-20 segundos
  API build + migrations:     2-3 minutos
  Seeds execution:            20-40 segundos
  Frontend build:             1-2 minutos
  TOTAL:                      4-6 minutos

Ejecuciones posteriores (imagenes cacheadas):
  PostgreSQL start:           5-10 segundos
  API start:                  15-30 segundos
  Seeds execution:            20-30 segundos
  Frontend start:             10-20 segundos
  TOTAL:                      1-2 minutos
```

## Ciclo de vida

```
1a ejecucion:
  docker-compose up -d --build
  |- Build API image
  |- Build Frontend image
  |- Create network monoflow-network
  |- Create volume postgres_data
  `- Start containers

Ejecuciones siguientes:
  docker-compose up -d
  |- Usa imagenes cacheadas
  `- Reinicia containers

Limpiar todo:
  docker-compose down -v
  |- Stop containers
  |- Remove network
  |- Remove volume (datos BD eliminados)
  `- Proxima vez recrea todo desde cero
```

## Estructura de archivos Docker

```
MonoFlow_MES/
+-- docker-compose.yml ............. Orquestacion principal
+-- .env.docker ..................... Variables de entorno (Docker)
+-- .env ............................ Variables de entorno (local/default)
+-- .dockerignore ................... Archivos excluidos del build
|
+-- backend/
|   +-- Dockerfile ................. Build API .NET 10
|   +-- seed_data.sql .............. Datos iniciales (operarios + ordenes)
|   +-- MonoFlow.api/ .............. Punto de entrada, Program.cs
|   +-- MonoFlow.application/ ...... Logica de negocio
|   +-- MonoFlow.domain/ ........... Modelos de dominio
|   `-- MonoFlow.infrastructure/ ... DbContext, migraciones, repos
|
`-- frontend/
    +-- Dockerfile ................. Build React + Nginx
    +-- nginx.conf ................. Config Nginx con proxy reverso
    +-- vite.config.ts
    `-- package.json
```
