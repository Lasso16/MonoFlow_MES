using MonoFlow.domain.Aggregates.Common;
using MonoFlow.infrastructure.Persistance;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories.Core
{
    public class Repository<T> : IRepository<T> where T : Entity, IAggregateRoot
    {
        protected readonly AppDbContext _dbContext;

        public IUnitOfWork UnitOfWork => _dbContext;

        public Repository(AppDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<T> AddAsync(T entity)
        {
            var entry = await _dbContext.Set<T>().AddAsync(entity);
            return entry.Entity;
        }

        public Task DeleteAsync(T entity)
        {
            _dbContext.Set<T>().Remove(entity);
            return Task.CompletedTask;
        }
    }
}
