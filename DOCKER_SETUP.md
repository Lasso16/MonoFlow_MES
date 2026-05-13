# Docker Setup - MonoFlow MES

## Requisitos

- Docker Desktop instalado (incluye Docker Engine y Docker Compose)
- Al menos 4 GB de RAM asignados a Docker
- Puertos disponibles: 5432 (PostgreSQL), 5000 (API), 80 (Frontend)

## Iniciar el proyecto

```bash
# Desde la raiz del proyecto
docker-compose --env-file .env.docker up -d --build
```

Docker Compose tambien detecta automaticamente el archivo `.env` de la raiz,
por lo que el siguiente comando equivale al anterior:

```bash
docker-compose up -d --build
```

### Servicios que se inician

1. **PostgreSQL 16** (puerto 5432)
   - Usuario: `postgres`
   - Password: `postgres`
   - BD: `monoflow_dev`
   - Health check: `pg_isready`

2. **API .NET 10** (puerto 5000)
   - URL: `http://localhost:5000`
   - Swagger: `http://localhost:5000/swagger`
   - Health check: `http://localhost:5000/health`
   - Aplica migraciones EF Core automaticamente al arrancar

3. **Frontend** (puerto 80)
   - URL: `http://localhost`
   - Nginx con proxy reverso hacia `api:5000`

4. **Seeds Service** (ejecuta una sola vez)
   - Espera a que el API este healthy
   - Ejecuta `backend/seed_data.sql` via psql
   - Se detiene tras completar la carga

## Flujo de inicializacion detallado

```
Inicio
  |
1. PostgreSQL inicia
   |- Acepta conexiones en ~10-20 segundos
   `- Health check: pg_isready -U postgres -d monoflow_dev
  |
2. API inicia (cuando PostgreSQL esta healthy)
   |- Conecta a PostgreSQL via Npgsql
   |- Ejecuta EF Core Migrations:
   |   |- Crea BD monoflow_dev si no existe
   |   |- Crea tabla: operarios
   |   |- Crea tabla: ordenes
   |   |- Crea tabla: articulos
   |   |- Crea tabla: operaciones
   |   `- Crea tabla: tipos_operacion (y resto segun modelo)
   |- API escucha en puerto 5000
   `- Health check: GET /health
  |
3. Seeds Service (cuando API esta healthy)
   |- Espera 10 segundos adicionales tras detectar API
   |- Ejecuta seed_data.sql:
   |   |- INSERT 100 operarios (generate_series)
   |   |- INSERT 2 tipos de operacion
   |   `- INSERT 8 ordenes con articulos y operaciones
   `- Se detiene
  |
4. Frontend inicia
   |- VITE_API_URL inyectado en tiempo de build
   `- Nginx sirve la app y hace proxy a api:5000
  |
Fin
```

## Detener servicios

```bash
# Parar pero mantener datos
docker-compose down

# Parar y eliminar TODA la BD
docker-compose down -v

# Solo pausar sin eliminar nada
docker-compose stop
```

## Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo API (util para ver migraciones)
docker-compose logs -f api

# Solo PostgreSQL
docker-compose logs -f postgres

# Solo Seeds
docker-compose logs -f seeds

# Solo Frontend
docker-compose logs -f frontend

# Ultimas 50 lineas
docker-compose logs --tail=50
```

## Conectarse a PostgreSQL

```bash
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev
```

Dentro de psql:

```sql
-- Ver cantidad de operarios
SELECT COUNT(*) FROM operarios;

-- Ver ordenes
SELECT id_navision, cliente, descripcion FROM ordenes;

-- Ver tipos de operacion
SELECT * FROM tipos_operacion;

-- Salir
\q
```

## Configuracion y personalizacion

### Cambiar credenciales de BD

Editar `.env.docker`:

```env
DB_USER=mi_usuario
DB_PASSWORD=MiPassword123
DB_NAME=mi_base_de_datos
```

Luego recrear el stack:

```bash
docker-compose down -v
docker-compose --env-file .env.docker up -d --build
```

### Cambiar puertos

Editar `docker-compose.yml`, modificar el primer numero de cada mapping:

```yaml
ports:
  - "5432:5432"   # PostgreSQL: cambiar 5432 (host)
  - "5000:5000"   # API:        cambiar 5000 (host)
  - "80:80"       # Frontend:   cambiar 80   (host)
```

## Verificacion de estado

```bash
# Estado de todos los contenedores
docker-compose ps

# Health del API
curl http://localhost:5000/health

# Conexion a PostgreSQL
docker exec monoflow-postgres pg_isready -U postgres -d monoflow_dev

# Ver volumenes
docker volume ls | grep monoflow
```

## Troubleshooting

### "Connection refused" en http://localhost:5000
**Causa**: API o PostgreSQL aun no estan listos.
```bash
docker-compose logs api | tail -20
docker-compose logs postgres | tail -20
# Esperar 60 segundos y volver a intentar
```

### Seeds no se ejecutan
**Causa**: API no completo migraciones a tiempo.
```bash
# Ver logs del servicio seeds
docker-compose logs seeds

# Ejecutar seeds manualmente
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev \
  -f /scripts/seed_data.sql
```

O via restart:

```bash
docker-compose restart seeds
```

### BD no persiste entre reinicios
**Causa**: Volumen no creado o eliminado con `down -v`.
```bash
docker volume ls
docker volume inspect monoflow_mes_postgres_data
```

Si el volumen no existe, recrear:

```bash
docker-compose down -v
docker-compose up -d --build
```

### Puerto ya en uso
**Causa**: Otro proceso ocupa el puerto.

En Windows:
```powershell
netstat -ano | findstr :5432
netstat -ano | findstr :5000
netstat -ano | findstr :80
```

En Linux/macOS:
```bash
lsof -i :5432
lsof -i :5000
```

Soluciones: cambiar el puerto en `docker-compose.yml` o detener el proceso conflictivo.

### PostgreSQL no responde
**Causa**: Memoria insuficiente o crash del contenedor.
```bash
# Ver logs
docker logs monoflow-postgres

# Reiniciar
docker restart monoflow-postgres

# Asegurar minimo 4 GB RAM en Docker Desktop
```

### Error en build del API
**Causa**: Problemas con dependencias o codigo.
```bash
# Build con output completo
docker-compose build --no-cache api

# Ver logs de build
docker-compose logs api
```

## Comandos utiles resumidos

```bash
# Iniciar
docker-compose --env-file .env.docker up -d --build

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Conectar a BD
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev

# Reconstruir API
docker-compose build --no-cache api

# Reiniciar servicio
docker-compose restart api

# Parar
docker-compose down

# Limpiar todo
docker-compose down -v
```

## Notas tecnicas

### Migraciones EF Core
- Se aplican automaticamente en `Program.cs` al arrancar el API
- Archivos en `backend/MonoFlow.infrastructure/Migrations/`
- Para agregar nuevas migraciones (en entorno local con .NET instalado):
  ```bash
  dotnet ef migrations add NombreMigracion --project backend/MonoFlow.infrastructure
  dotnet ef database update --project backend/MonoFlow.infrastructure
  ```

### Seeds
- Script unificado: `backend/seed_data.sql`
- Usa `ON CONFLICT DO NOTHING` para ser idempotente
- El servicio `seeds` espera 120 segundos a que el API este healthy

### Red Docker
- Todos los servicios usan `monoflow-network` (bridge)
- Comunicacion interna por nombre de servicio: `postgres`, `api`, `frontend`
- Desde el host se accede por `localhost` con los puertos mapeados

### Volumen
- `postgres_data`: persiste `/var/lib/postgresql/data`
- `docker-compose down` conserva el volumen
- `docker-compose down -v` elimina el volumen y todos los datos

## Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [.NET Docker Images](https://hub.docker.com/_/microsoft-dotnet-aspnet)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Entity Framework Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Npgsql - PostgreSQL for .NET](https://www.npgsql.org/)
