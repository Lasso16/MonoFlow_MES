

-- ==========================================
-- 1. CATÁLOGOS Y TABLAS MAESTRAS (Obligatorio que vayan primero)
-- ==========================================

-- Operarios (Del 2 al 100)
INSERT INTO operarios (id, numero_operario, nombre, activo, rol)
SELECT gen_random_uuid(), i, 'Operario ' || i::text, true, 'Operario'
FROM generate_series(2, 100) AS t(i)
ON CONFLICT (numero_operario) DO NOTHING;

-- Operario Principal
INSERT INTO operarios (id, numero_operario, nombre, activo, rol)
VALUES (gen_random_uuid(), 1, 'Operario Principal', true, 'Admin')
ON CONFLICT (numero_operario) 
DO UPDATE SET rol = 'Admin', nombre = 'Operario Principal';

-- Tipos de operación
INSERT INTO tipos_operacion (id, tipo) VALUES 
(1, 'Ensamblaje'), 
(2, 'Control de Calidad')
ON CONFLICT DO NOTHING;

-- Tipos de Eventos (NUEVO: Moviéndolo arriba)
INSERT INTO tipos_evento (id, tipo) VALUES 
(1, 'Preparación'),
(2, 'Ejecución'),
(3, 'Incidencia'),
(4, 'Pausa'),
(5, 'Recogida'),
(6, 'Última Recogida')
ON CONFLICT DO NOTHING;

-- Tipos de Incidencia (NUEVO: Moviéndolo arriba)
INSERT INTO tipos_incidencia (id, tipo) VALUES 
(1, 'Falta de Material'),
(2, 'Avería Mecánica'),
(3, 'Fallo Eléctrico'),
(4, 'Ajuste de Parámetros'),
(5, 'Ausencia de Operario')
ON CONFLICT DO NOTHING;

-- Tipos de Rechazo (NUEVO: Moviéndolo arriba)
INSERT INTO tipos_rechazo (id, motivo) VALUES 
(1, 'Defecto Estético'),
(2, 'Dimensiones Fuera de Rango'),
(3, 'Material Defectuoso'),
(4, 'Error de Montaje'),
(5, 'Prueba de Setup')
ON CONFLICT DO NOTHING;

COMMIT;
-- Órdenes
WITH order_ids AS (
    SELECT 
        'ORD-001'::text as id_navision,
        'Cliente A'::text as cliente,
        'Orden sin artículos 1'::text as descripcion,
        1 as seq
    UNION ALL
    SELECT 'ORD-002', 'Cliente B', 'Orden sin artículos 2', 2
    UNION ALL
    SELECT 'ORD-003', 'Cliente C', 'Orden con artículos sin operaciones 1', 3
    UNION ALL
    SELECT 'ORD-004', 'Cliente D', 'Orden con artículos sin operaciones 2', 4
    UNION ALL
    SELECT 'ORD-005', 'Cliente E', 'Orden con operaciones 1', 5
    UNION ALL
    SELECT 'ORD-006', 'Cliente F', 'Orden con operaciones 2', 6
    UNION ALL
    SELECT 'ORD-007', 'Cliente G', 'Orden con operaciones 3', 7
    UNION ALL
    SELECT 'ORD-008', 'Cliente H', 'Orden con operaciones 4', 8
)
INSERT INTO ordenes (id, id_navision, estado, descripcion, cliente, codigo_procedencia, fecha_creacion)
SELECT gen_random_uuid(), id_navision, 'PENDIENTE', descripcion, cliente, NULL, NOW()
FROM order_ids
ON CONFLICT DO NOTHING;

-- Artículos
WITH articles AS (
    SELECT gen_random_uuid() as orden_id, 'ORD-003' as orden_ref, 'REF-A001'::text as ref, 1 as linea, 10 as qty, 'Artículo 1 - Orden 3'::text as desc
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-003', 'REF-A002', 2, 5, 'Artículo 2 - Orden 3'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-004', 'REF-B001', 1, 8, 'Artículo 1 - Orden 4'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-004', 'REF-B002', 2, 12, 'Artículo 2 - Orden 4'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-005', 'REF-C001', 1, 20, 'Artículo 1 - Orden 5'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-005', 'REF-C002', 2, 15, 'Artículo 2 - Orden 5'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-006', 'REF-D001', 1, 10, 'Artículo 1 - Orden 6'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-006', 'REF-D002', 2, 10, 'Artículo 2 - Orden 6'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-007', 'REF-E001', 1, 7, 'Artículo 1 - Orden 7'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-007', 'REF-E002', 2, 3, 'Artículo 2 - Orden 7'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-008', 'REF-F001', 1, 25, 'Artículo 1 - Orden 8'
    UNION ALL
    SELECT gen_random_uuid(), 'ORD-008', 'REF-F002', 2, 30, 'Artículo 2 - Orden 8'
)
INSERT INTO articulos (id, id_orden, referencia, linea, cantidad, descripcion, inicio_plan, fin_plan, estado)
SELECT a.orden_id, o.id, a.ref, a.linea, a.qty, a.desc, NULL, NULL, 'PENDIENTE'
FROM articles a
JOIN ordenes o ON o.id_navision = a.orden_ref
ON CONFLICT DO NOTHING;

-- Operaciones
WITH operations AS (
    SELECT 'ORD-005'::text as orden_ref, 'REF-C001' as art_ref, 1 as tipo_op, 20 as cantidad, 30.0 as tiempo_plan, false as ultima
    UNION ALL
    SELECT 'ORD-005', 'REF-C001', 2, 20, 15.0, true
    UNION ALL
    SELECT 'ORD-005', 'REF-C002', 1, 15, 30.0, false
    UNION ALL
    SELECT 'ORD-005', 'REF-C002', 2, 15, 15.0, true
    UNION ALL
    SELECT 'ORD-006', 'REF-D001', 1, 10, 25.0, false
    UNION ALL
    SELECT 'ORD-006', 'REF-D001', 2, 10, 10.0, true
    UNION ALL
    SELECT 'ORD-006', 'REF-D002', 1, 10, 25.0, false
    UNION ALL
    SELECT 'ORD-006', 'REF-D002', 2, 10, 10.0, true
    UNION ALL
    SELECT 'ORD-007', 'REF-E001', 1, 7, 20.0, false
    UNION ALL
    SELECT 'ORD-007', 'REF-E001', 2, 7, 10.0, true
    UNION ALL
    SELECT 'ORD-007', 'REF-E002', 1, 3, 20.0, false
    UNION ALL
    SELECT 'ORD-007', 'REF-E002', 2, 3, 10.0, true
    UNION ALL
    SELECT 'ORD-008', 'REF-F001', 1, 25, 40.0, false
    UNION ALL
    SELECT 'ORD-008', 'REF-F001', 2, 25, 20.0, true
    UNION ALL
    SELECT 'ORD-008', 'REF-F002', 1, 30, 40.0, false
    UNION ALL
    SELECT 'ORD-008', 'REF-F002', 2, 30, 20.0, true
)
INSERT INTO operaciones (id, id_articulo, id_tipo_operacion, cantidad_componentes, cantidad_total, tiempo_plan, tiempo_total, ultima_operacion, estado, inicio, fin)
SELECT gen_random_uuid(), a.id, o.tipo_op, NULL, o.cantidad, o.tiempo_plan, 0, o.ultima, 'Pendiente', NULL, NULL
FROM operations o
JOIN articulos a ON a.referencia = o.art_ref
JOIN ordenes ord ON ord.id = a.id_orden AND ord.id_navision = o.orden_ref
ON CONFLICT DO NOTHING;

COMMIT;
