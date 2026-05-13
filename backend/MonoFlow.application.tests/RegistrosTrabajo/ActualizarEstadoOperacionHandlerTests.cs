using MonoFlow.application.RegistrosTrabajo.DomainEventHandlers;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Events;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class ActualizarEstadoOperacionHandlerTests
{
    private static (
        Mock<IOperacionRepository> operacionRepo,
        Mock<IArticuloRepository> articuloRepo,
        Mock<IOrdenRepository> ordenRepo,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var operacionRepo = new Mock<IOperacionRepository>();
        operacionRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (operacionRepo, new Mock<IArticuloRepository>(), new Mock<IOrdenRepository>(), uow);
    }

    [Fact]
    public async Task Handle_ProduccionRegistrada_OperacionNoEncontrada_NoGuarda()
    {
        var (operacionRepo, articuloRepo, ordenRepo, uow) = BuildMocks();
        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(It.IsAny<Guid>())).ReturnsAsync((Operacion?)null);

        var handler = new ActualizarEstadoOperacionHandler(operacionRepo.Object, articuloRepo.Object, ordenRepo.Object);
        await handler.Handle(new ProduccionRegistradaDomainEvent(Guid.NewGuid(), Cantidad.Create(1)), CancellationToken.None);

        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProduccionRegistrada_Exito_GuardaCambios()
    {
        var (operacionRepo, articuloRepo, ordenRepo, uow) = BuildMocks();
        var operacionId = Guid.NewGuid();
        var operacion = new Operacion(Guid.NewGuid(), 1, Cantidad.Create(10));

        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(operacionId)).ReturnsAsync(operacion);
        operacionRepo.Setup(r => r.GetByIdAsync(operacionId)).ReturnsAsync((Operacion?)null);
        ordenRepo.Setup(r => r.GetOrdenByOperacionIdAsync(operacionId)).ReturnsAsync((Orden?)null);

        var handler = new ActualizarEstadoOperacionHandler(operacionRepo.Object, articuloRepo.Object, ordenRepo.Object);
        await handler.Handle(new ProduccionRegistradaDomainEvent(operacionId, Cantidad.Create(2)), CancellationToken.None);

        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
