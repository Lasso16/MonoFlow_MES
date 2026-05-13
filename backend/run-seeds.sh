#!/bin/bash
set -e

echo "Aguardando a que el API esté listo para ejecutar seeds..."

# Esperar a que las migraciones se hayan aplicado (cuando el API esté healthy)
for i in {1..60}; do
    if curl -f http://api:5000/health 2>/dev/null; then
        echo "API está listo - ejecutando seeds..."
        break
    fi
    echo "Intento $i/60 - API no está listo, esperando..."
    sleep 2
done

# Ejecutar los seeds
echo "Ejecutando seed de operarios..."
/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P Admin@12345 -d MonoFlow_Dev -i /docker-entrypoint-initdb.d/2-operarios.sql

echo "Ejecutando seed de órdenes..."
/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P Admin@12345 -d MonoFlow_Dev -i /docker-entrypoint-initdb.d/3-ordenes.sql

echo "Seeds ejecutados correctamente"
