#!/bin/bash
set -e

# Esperar a que SQL Server esté listo
echo "Esperando a SQL Server..."
for i in {1..30}; do
    if /opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P Admin@12345 -Q "SELECT 1" 2>/dev/null; then
        echo "SQL Server está listo"
        break
    fi
    echo "Intento $i/30 - esperando 2 segundos..."
    sleep 2
done

# Crear la BD si no existe
echo "Creando base de datos..."
/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P Admin@12345 -Q "
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MonoFlow_Dev')
BEGIN
    CREATE DATABASE MonoFlow_Dev;
END
"

echo "Base de datos lista"
