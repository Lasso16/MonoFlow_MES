using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.domain.Aggregates.Incidencias;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Producciones;
using MonoFlow.domain.Aggregates.ProduccionesRechazadas;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.SesionesOperarios;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.api.BackgroundServices;
using MonoFlow.api.Infrastructure;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Common;

using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(IAppDbContext).Assembly);
});

builder.Services.AddCommandValidators(typeof(IAppDbContext).Assembly);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddHostedService<ProcessOutboxMessagesJob>();


builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

builder.Services.AddScoped<IOperarioRepository, OperarioRepository>();
builder.Services.AddScoped<IOrdenRepository, OrdenRepository>();
builder.Services.AddScoped<IRegistroTrabajoRepository, RegistroTrabajoRepository>();
builder.Services.AddScoped<IArticuloRepository, ArticuloRepository>();
builder.Services.AddScoped<IEventoRepository, EventoRepository>();
builder.Services.AddScoped<IIncidenciaRepository, IncidenciaRepository>();
builder.Services.AddScoped<IOperacionRepository, OperacionRepository>();
builder.Services.AddScoped<IProduccionRepository, ProduccionRepository>();
builder.Services.AddScoped<IRechazosRepository, RechazoRepository>();
builder.Services.AddScoped<ISesionOperarioRepository, SesionOperarioRepository>();
builder.Services.AddScoped<ITipoEventoRepository, TipoEventoRepository>();
builder.Services.AddScoped<ITipoIncidenciaRepository, TipoIncidenciaRepository>();
builder.Services.AddScoped<ITipoOperacionRepository, TipoOperacionRepository>();
builder.Services.AddScoped<ITipoRechazoRepository, TipoRechazoRepository>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    }); builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHealthChecks();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
    

var app = builder.Build();

app.MapHealthChecks("/health");

app.UseCors("AllowAll");

app.UseExceptionHandler();

// 1. SWAGGER SIEMPRE ACTIVO Y EN LA RUTA RAÍZ
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MonoFlow API");
    c.RoutePrefix = string.Empty; // <-- ESTO ES LA MAGIA: Carga Swagger en localhost:5000/
});

// 2. Comentamos la redirección HTTPS que da problemas de 404 en Docker local
// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

// 3. Inicialización de la BD
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("Base de datos lista.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Ocurrió un error al inicializar la base de datos: {ex.Message}");
    }
}

app.Run();