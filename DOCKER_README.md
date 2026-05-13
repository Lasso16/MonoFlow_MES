# MonoFlow MES - Docker Quick Start

## Inicio rapido

```bash
# Iniciar todos los servicios
docker-compose --env-file .env.docker up -d --build

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f
```

URLs de acceso:
- Frontend: http://localhost
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Health: http://localhost:5000/health
- PostgreSQL: localhost:5432 (user: postgres, password: postgres)

## Flujo de inicio

1. **PostgreSQL** inicia y crea la BD `monoflow_dev`
2. **API** inicia, aplica migraciones EF Core y crea todas las tablas
3. **Seeds service** espera al API y ejecuta `seed_data.sql`
4. **Frontend** inicia y conecta al API via Nginx

El proceso completo tarda 4-6 minutos en la primera ejecucion (build incluido).
Ejecuciones siguientes: 1-2 minutos (imagenes cacheadas).

## Detener

```bash
docker-compose down      # Mantener datos
docker-compose down -v   # Eliminar todo (incluida BD)
```

## Credenciales por defecto

| Servicio    | Usuario    | Password   | BD            |
|-------------|------------|------------|---------------|
| PostgreSQL  | postgres   | postgres   | monoflow_dev  |

Editar `.env.docker` para cambiar.

## Base de datos

- Motor: PostgreSQL 16
- BD: `monoflow_dev`
- Tablas principales: operarios (100 registros), ordenes (8), articulos, operaciones
- Datos: cargados automaticamente por el servicio `seeds`
- Persistencia: volumen Docker `postgres_data`

## Problemas comunes

| Problema | Solucion |
|----------|----------|
| "Connection refused" en API | Esperar 60 segundos, BD aun iniciando |
| Puerto en uso | Cambiar en `docker-compose.yml` o detener otro servicio |
| BD no persiste | Verificar con `docker volume ls` |
| Seeds no se ejecutan | Ver logs: `docker-compose logs seeds` |

## Comandos utiles

```bash
# Conectar a PostgreSQL
docker exec -it monoflow-postgres psql -U postgres -d monoflow_dev

# Logs en tiempo real de un servicio
docker-compose logs -f api

# Reconstruir solo el API
docker-compose build --no-cache api

# Reiniciar un servicio
docker-compose restart api

# Re-ejecutar seeds
docker-compose restart seeds
```

Ver [DOCKER_SETUP.md](./DOCKER_SETUP.md) para instrucciones detalladas y troubleshooting.
Ver [DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md) para diagrama de arquitectura.
