FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos de proyecto
COPY ["MonoFlow.api/MonoFlow.api.csproj", "MonoFlow.api/"]
COPY ["MonoFlow.application/MonoFlow.application.csproj", "MonoFlow.application/"]
COPY ["MonoFlow.domain/MonoFlow.domain.csproj", "MonoFlow.domain/"]
COPY ["MonoFlow.infrastructure/MonoFlow.infrastructure.csproj", "MonoFlow.infrastructure/"]

# Restaurar dependencias
RUN dotnet restore "MonoFlow.api/MonoFlow.api.csproj"

# Copiar todo el código
COPY . .

# Build
RUN dotnet build "MonoFlow.api/MonoFlow.api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "MonoFlow.api/MonoFlow.api.csproj" -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Instalar herramientas para healthchecks y scripts
RUN apt-get update && apt-get install -y curl netcat-traditional && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
EXPOSE 5000

ENTRYPOINT ["dotnet", "MonoFlow.api.dll"]