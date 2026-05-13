# MonoFlow Frontend

Aplicación frontend para la gestión de terminal de producción y panel de administración de MonoFlow.

## Qué hace

La aplicación está dividida en dos áreas principales:

- Terminal de planta para operar registros de trabajo, pausas, incidencias, producción y cierre de registros.
- Panel de administración para consultar órdenes, crear órdenes, revisar el estado de planta y generar informes.

## Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Material UI
- React Hook Form
- Zod
- React Error Boundary

## Requisitos

- Node.js 20 o superior recomendado
- npm
- Acceso a la API backend del proyecto

## Instalación

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto.

3. Define la URL base del backend:

```env
VITE_API_URL=http://localhost:5000
```

La aplicación también acepta `NEXT_PUBLIC_API_URL` como fallback, pero se recomienda usar `VITE_API_URL`.

## Scripts

```bash
npm run start   # Ejecuta Vite en modo desarrollo
npm run build   # Genera el build de producción
npm run preview # Sirve localmente el build generado
npm run lint    # Ejecuta ESLint sobre el proyecto
```

## Estructura del proyecto

- `src/api`: cliente HTTP y funciones por dominio.
- `src/model`: contratos de datos, respuestas y agregados.
- `src/hooks/queries`: hooks de React Query.
- `src/pages/terminal`: flujo operativo de la terminal.
- `src/pages/admin`: pantallas y lógica del panel administrativo.
- `src/components`: componentes compartidos.
- `src/utils`: utilidades generales.

## Rutas principales

- `/terminal`
- `/terminal/operacion/:id`
- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/admin/ordenes`
- `/admin/crear-orden`
- `/admin/ordenes/:id`
- `/admin/estado-planta`
- `/admin/informes`

## Flujo de terminal

La vista terminal se organiza alrededor de un orquestador central que compone datos, mutaciones y estados de UI.

Archivos clave:

- [src/pages/terminal/TerminalPage.tsx](src/pages/terminal/TerminalPage.tsx)
- [src/pages/terminal/hooks/useTerminalOrchestrator.ts](src/pages/terminal/hooks/useTerminalOrchestrator.ts)
- [src/pages/terminal/terminalPropsBuilder.ts](src/pages/terminal/terminalPropsBuilder.ts)

Funciones principales:

- Seleccionar una operación.
- Gestionar el equipo de operarios.
- Iniciar y finalizar registros.
- Registrar pausas, incidencias, producción y rechazos.
- Consultar el historial del registro activo.

## Flujo de administración

El acceso de administración se valida desde el frontend mediante sesión local de operario con rol admin.

Archivos clave:

- [src/pages/admin/AdminLoginPage.tsx](src/pages/admin/AdminLoginPage.tsx)
- [src/components/auth/ProtectedRoute.tsx](src/components/auth/ProtectedRoute.tsx)
- [src/utils/authUtils.ts](src/utils/authUtils.ts)
- [src/pages/layouts/AdminLayout.tsx](src/pages/layouts/AdminLayout.tsx)

Módulos principales:

- Órdenes
- Crear orden
- Estado de planta
- Informes

## Capa de API

La comunicación con backend está centralizada en `src/api`.

Archivos relevantes:

- [src/api/apiClient.ts](src/api/apiClient.ts)
- [src/api/ordenesApi.ts](src/api/ordenesApi.ts)
- [src/api/operacionesApi.ts](src/api/operacionesApi.ts)
- [src/api/articulosApi.ts](src/api/articulosApi.ts)
- [src/api/operariosApi.ts](src/api/operariosApi.ts)
- [src/api/maestrosApi.ts](src/api/maestrosApi.ts)
- [src/api/registroTrabajoApi.ts](src/api/registroTrabajoApi.ts)

## Manejo de estado y errores

- React Query se usa para cache, invalidación y sincronización de datos.
- El árbol de la aplicación está envuelto en un `ErrorBoundary` global.
- Las secciones críticas tienen barreras de error específicas.

## Autenticación admin

La sesión de admin se guarda en `localStorage` con la clave `monoflow.admin.session`.

Limitaciones actuales:

- No hay autenticación server-side completa.
- No hay expiración automática de sesión.
- La validación depende del rol devuelto por la API y de la persistencia local.

## Estado actual

La base funcional principal está implementada. Antes de considerar el proyecto listo para producción, conviene cerrar estos puntos:

- Añadir pruebas automatizadas.
- Documentar el backend esperado y sus endpoints.
- Endurecer autenticación y gestión de sesión.
- Completar o eliminar pantallas o exports pendientes.
- Documentar el despliegue.

## Desarrollo

Si quieres revisar la aplicación en local:

1. Configura `.env`.
2. Ejecuta `npm run start`.
3. Abre la URL que muestra Vite en el navegador.

## Notas

- Si el backend devuelve formatos de respuesta distintos, la capa `src/api/apiClient.ts` ya incluye normalización parcial para respuestas paginadas y errores.
- El comportamiento de la terminal depende del contrato de la API; cualquier cambio de backend puede afectar hooks y transformaciones de datos.
