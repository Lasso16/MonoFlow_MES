# Terminal Page — Documentación

Resumen de alto nivel y flujo:

- `TerminalPage` es la entrada de la vista terminal. Invoca al orquestador para construir las props y renderiza el layout principal y los diálogos.

Flujo principal (resumen):

TerminalPage -> useTerminalOrchestrator -> buildTerminalProps + hooks de flujo -> TerminalMainContent + TerminalDialogsPanel

Componentes y ficheros clave

- Archivo: [src/pages/terminal/TerminalPage.tsx](src/pages/terminal/TerminalPage.tsx)
  - Componente: `TerminalPage`
  - Función: punto de entrada de la página. Obtiene `id` desde la ruta (`useParams`) y llama a `useTerminalOrchestrator(id, navigate)` para recibir:
    - `operacionLoadErrorMessage` (mensaje de error si falla la carga)
    - `mainContentProps` (props para `TerminalMainContent`)
    - `dialogsProps` (props para `TerminalDialogsPanel`)
  - Renderiza: `TerminalLayout`, `TerminalMainContent` y `TerminalDialogsPanel`.

- Archivo: [src/pages/terminal/hooks/useTerminalOrchestrator.ts](src/pages/terminal/hooks/useTerminalOrchestrator.ts)
  - Hook: `useTerminalOrchestrator(id, navigate)`
  - Función: orquesta todos los sub-hooks y mutaciones necesarias (datos, estados y flujos de acciones). Construye `mainContentProps` y `dialogsProps` que alimentan la UI.
  - Llama a:
    - `useTerminalData` para obtener `operacion`, `progreso`, tipos de incidencias/rechazo, registroActualOperacion, artículo y orden.
    - `useTerminalRegistroState` para derivar estado del registro (si hay registro activo, siguiente evento, etiquetas de botón, etc.).
    - Flujos: `useTerminalPauseFlow`, `useTerminalIncidenciaFlow`, `useTerminalProduccionFlow`, `useTerminalAccionesFlow` para comportamientos de pausa, incidencias, producción y controles generales.
    - `buildTerminalProps` para convertir los handlers y estados en las props concretas que consumen los componentes (botones/diálogos/snackbar).

- Archivo: [src/pages/terminal/terminalPropsBuilder.ts](src/pages/terminal/terminalPropsBuilder.ts)
  - Función: `buildTerminalProps(args)`
  - Función: Recibe un conjunto grande de flags y handlers (desde el orquestador y los flujos) y devuelve:
    - `terminalControlsProps`: objeto con los handlers y flags que consume el grid de controles (labels, disabled, loading, lock flags, etc.).
    - `dialogsProps`: props agrupadas para los diálogos (snackbar, pausa, observación, incidencia, producción).
  - Nota: mantiene la lógica de derivación de qué botones mostrar/activar en la UI.

Hooks de datos y estado

- [src/pages/terminal/hooks/useTerminalData.ts](src/pages/terminal/hooks/useTerminalData.ts)
  - Hook: `useTerminalData(id)`
  - Función: consulta la API mediante hooks de queries para obtener `operacion`, `progreso`, `registroActualOperacion`, `tiposIncidencia` y `tiposRechazo`. Normaliza los tipos de rechazo.
  - Devuelve flags de carga/errores y `operacionLoadErrorMessage`.

- [src/pages/terminal/hooks/useTerminalRegistroState.ts](src/pages/terminal/hooks/useTerminalRegistroState.ts)
  - Hook: `useTerminalRegistroState({ registroActualOperacion, selectedOperarioIdsCount })`
  - Función: procesa el registro actual y eventos para generar:
    - `hasRegistroActivo`, `equipoCount`, `nextEventoTipo`, `startActionLabel`, `currentEventType`, `hasRecogida`, etc.
  - Uso: determina texto y next-step para el botón de inicio/avance.

Flujos (control de UI + mutaciones)

- [src/pages/terminal/hooks/useTerminalAccionesFlow.ts](src/pages/terminal/hooks/useTerminalAccionesFlow.ts)
  - Provee handlers de acciones principales: `handleIniciarRegistro`, `handleFinalizarRegistro`, `handleOpenObservacionDialog`, `handleConfirmObservacion`, y control de bloqueo del equipo.
  - Usa mutaciones (registrar evento/abrir registro/finalizar) pasadas desde el orquestador.

- [src/pages/terminal/hooks/useTerminalPauseFlow.ts](src/pages/terminal/hooks/useTerminalPauseFlow.ts)
  - Gestiona la lógica de pausas: abrir diálogo, iniciar pausa, confirmar pausa, reanudar (incluye observación automática al reanudar).
  - Expone flags: `isPausaActiva`, `isPauseDialogOpen`, `handlePauseAction`, `handleConfirmPause`, `isPauseLoading`.

- [src/pages/terminal/hooks/useTerminalIncidenciaFlow.ts](src/pages/terminal/hooks/useTerminalIncidenciaFlow.ts)
  - Gestiona la lógica de incidencias: abrir diálogo, enviar incidencia, marcar incidencia activa y reanudar después de incidencia.
  - Expone: `isIncidenciaActiva`, `handleOpenIncidenciaDialog`, `handleConfirmIncidencia`, `handleResumeIncidencia`.

- [src/pages/terminal/hooks/useTerminalProduccionFlow.ts](src/pages/terminal/hooks/useTerminalProduccionFlow.ts)
  - Gestiona el diálogo de producción (piezas buenas/rechazadas), envía mutaciones y decide si avanzar evento o pedir confirmación.

- [src/pages/terminal/hooks/useTerminalDialogsState.ts](src/pages/terminal/hooks/useTerminalDialogsState.ts)
  - Hook ligero para mantener el estado UI de diálogos cuando cambia `operacionId`.

Componentes UI principales

- [src/pages/terminal/components/TerminalMainContent.tsx](src/pages/terminal/components/TerminalMainContent.tsx)
  - Componente: `TerminalMainContent`
  - Recibe (vía `mainContentProps`) los paquetes:
    - `selectorProps` (control del selector de operación)
    - `teamProps` (estado del equipo/operarios)
    - `operacionData` (datos mostrados en la tarjeta de operación)
    - `controlsProps` (antes `actionsProps`) — consumido por el grid de botones
    - `historyProps` (props para `TerminalHistoryTable`)
  - Renderiza: `OperationDataCard` (con el selector inline), `TeamManagementCard`, `TerminalControlsGrid` y `TerminalHistoryTable`.

- [src/pages/terminal/components/ProjectScopeCard/OperationSelectorCard.tsx](src/pages/terminal/components/ProjectScopeCard/OperationSelectorCard.tsx)
  - Componente: `OperationSelectorCard` (antes `ProjectScopeCard`)
  - Función: botón/diálogo para seleccionar una operación (lista de artículos y operaciones). Usa queries `useGetArticulos` y `useGetOperacionesArticulo`.
  - Props: `selectedOperacionId`, `onSelectOperacion`, `onClearOperacion`, `buttonOnly`.

- [src/pages/terminal/components/OperationDataCard/OperationDataCard.tsx](src/pages/terminal/components/OperationDataCard/OperationDataCard.tsx)
  - Componente que muestra detalles de la operación: cliente, progreso, descripción y el `operationSelectorControl` (incrustado).

- [src/pages/terminal/components/TeamManagementCard/TeamManagementCard.tsx](src/pages/terminal/components/TeamManagementCard/TeamManagementCard.tsx)
  - Maneja selección de operarios, bloqueo de equipo y acciones relacionadas con el equipo.

- [src/pages/terminal/components/TerminalControlsGrid/TerminalControlsGrid.tsx](src/pages/terminal/components/TerminalControlsGrid/TerminalControlsGrid.tsx)
  - Componente: `TerminalControlsGrid` (antes `TerminalActionsGrid`)
  - Función: grid visual de controles (Iniciar, Incidencia, Pausar/Reanudar, Observaciones, Producción, Finalizar). Consume `controlsProps` para labels, handlers y estados `disabled/loading`.

- [src/pages/terminal/components/TerminalHistoryTable/TerminalHistoryTable.tsx](src/pages/terminal/components/TerminalHistoryTable/TerminalHistoryTable.tsx)
  - Muestra el historial de eventos del registro (eventos, incidencias, duraciones). Consume `registroActualOperacion` y tipos de evento.

Diálogos y notificaciones

- [src/pages/terminal/components/TerminalDialogsPanel.tsx](src/pages/terminal/components/TerminalDialogsPanel.tsx)
  - Componente contenedor que agrupa todos los diálogos de la página y el snackbar de errores.
  - Incluye: `RegistroErrorSnackbar`, `PauseReasonDialog`, `ObservacionDialog`, `IncidenciaDialog`, `ProduccionDialog`.

- [src/pages/terminal/components/RegistroErrorSnackbar.tsx](src/pages/terminal/components/RegistroErrorSnackbar.tsx)
  - Snackbar que muestra `registroErrorAviso` (warning) y se cierra automáticamente.

- [src/pages/terminal/components/PauseReasonDialog.tsx](src/pages/terminal/components/PauseReasonDialog.tsx)
  - Diálogo para confirmar motivo de pausa y enviar la acción de pausa.

- [src/pages/terminal/components/ObservacionDialog.tsx](src/pages/terminal/components/ObservacionDialog.tsx)
  - Diálogo para añadir observaciones durante un registro.

- [src/pages/terminal/components/IncidenciaDialog.tsx](src/pages/terminal/components/IncidenciaDialog.tsx)
  - Diálogo para seleccionar tipo de incidencia y enviar la incidencia asociada a la operación.

- [src/pages/terminal/components/ProduccionDialog.tsx](src/pages/terminal/components/ProduccionDialog.tsx)
  - Diálogo para introducir piezas buenas/rechazadas y registrar producción/rechazo.

Utiles y queries (menciones rápidas)

- Hooks de queries utilizados en `useTerminalData` y componentes:
  - `useGetOperacionById`, `useGetOperacionProgreso` (operaciones)
  - `useGetArticuloById`, `useGetArticulos` (artículos)
  - `useGetOrdenById` (ordenes)
  - `useGetRegistroActualOperacion` (registro trabajo)
  - `useGetTiposIncidencia`, `useGetTiposRechazo`, `useGetTiposEvento` (maestros)

Mapa rápido de llamadas (call-graph simplificado)

TerminalPage
  -> useTerminalOrchestrator
    -> useTerminalData
    -> useTerminalRegistroState
    -> useTerminalPauseFlow
    -> useTerminalIncidenciaFlow
    -> useTerminalProduccionFlow
    -> useTerminalAccionesFlow
    -> buildTerminalProps
  -> TerminalMainContent (con `mainContentProps`)
    -> OperationDataCard (incluye OperationSelectorCard)
    -> TeamManagementCard
    -> TerminalControlsGrid (consume `controlsProps`)
    -> TerminalHistoryTable
  -> TerminalDialogsPanel (con `dialogsProps`)
    -> RegistroErrorSnackbar, PauseReasonDialog, ObservacionDialog, IncidenciaDialog, ProduccionDialog

Notas y recomendaciones

- Nombres: se renombraron internamente `ProjectScopeCard` -> `OperationSelectorCard` y `TerminalActionsGrid` -> `TerminalControlsGrid` para que el fichero y la carpeta coincidan con la exportación. También se alinearon los nombres de props y clases de la zona de controles para evitar mezclar `actions` y `controls`.

- Props agrupadas: `buildTerminalProps` centraliza la transformación de estados/handlers a props UI — es el lugar correcto para ajustar reglas de habilitado/visible para los botones.

- Testing: para asegurar que los renombrados no rompieron imports indirectos, ejecutar el build/TypeScript check o buscar referencias faltantes en el repo.

---

Si quieres, puedo:

- Añadir diagramas ASCII o Mermaid del flujo (si prefieres visual). 
- Renombrar los archivos CSS y clases para completar la consistencia de nombres.
- Ejecutar un chequeo rápido de TypeScript/ESLint en el workspace (dime si quieres que lo haga). 

