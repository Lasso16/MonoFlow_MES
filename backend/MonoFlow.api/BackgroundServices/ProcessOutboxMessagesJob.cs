using MonoFlow.domain.Aggregates.Common;
using MonoFlow.infrastructure.Outbox;
using MonoFlow.infrastructure.Persistance;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Text.Json;

namespace MonoFlow.api.BackgroundServices
{
    public sealed class ProcessOutboxMessagesJob : BackgroundService
    {
        private const int BatchSize = 20;
        private static readonly TimeSpan Interval = TimeSpan.FromSeconds(5);
        private const string LockResource = "MonoFlow_outbox_processor";

        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ProcessOutboxMessagesJob> _logger;

        public ProcessOutboxMessagesJob(
            IServiceProvider serviceProvider,
            ILogger<ProcessOutboxMessagesJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBatchAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error procesando mensajes Outbox.");
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }

        private async Task ProcessBatchAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();

            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();

            var lockAcquired = await TryAcquireLockAsync(dbContext, cancellationToken);
            if (!lockAcquired)
            {
                return;
            }

            var messages = await dbContext.OutboxMessages
                .Where(x => x.ProcessedOnUtc == null)
                .OrderBy(x => x.OccurredOnUtc)
                .ThenBy(x => x.Id)
                .Take(BatchSize)
                .ToListAsync(cancellationToken);

            foreach (var message in messages)
            {
                try
                {
                    var domainEvent = DeserializeDomainEvent(message);
                    await publisher.Publish(domainEvent, cancellationToken);

                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = null;
                }
                catch (Exception ex)
                {
                    message.Error = ex.ToString();
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
        }

        private static IDomainEvent DeserializeDomainEvent(OutboxMessage message)
        {
            var type = ResolveType(message.Type)
                ?? throw new InvalidOperationException($"No se encontro el tipo de evento '{message.Type}'.");

            var domainEvent = JsonSerializer.Deserialize(message.Content, type) as IDomainEvent;

            return domainEvent
                ?? throw new InvalidOperationException($"No se pudo deserializar el evento '{message.Type}'.");
        }

        private static Type? ResolveType(string typeName)
        {
            var directType = Type.GetType(typeName, throwOnError: false);
            if (directType is not null)
            {
                return directType;
            }

            return AppDomain.CurrentDomain
                .GetAssemblies()
                .Select(assembly => assembly.GetType(typeName, throwOnError: false))
                .FirstOrDefault(type => type is not null);
        }

        private static async Task<bool> TryAcquireLockAsync(AppDbContext dbContext, CancellationToken cancellationToken)
        {
            var connection = dbContext.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
            {
                await connection.OpenAsync(cancellationToken);
            }

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT pg_try_advisory_lock(hashtext(@resource)::bigint)";

            var resourceParameter = command.CreateParameter();
            resourceParameter.ParameterName = "@resource";
            resourceParameter.Value = LockResource;
            command.Parameters.Add(resourceParameter);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return Convert.ToBoolean(result);
        }
    }
}