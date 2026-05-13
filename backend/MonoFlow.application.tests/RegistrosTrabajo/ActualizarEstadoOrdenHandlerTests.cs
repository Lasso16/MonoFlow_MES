using MonoFlow.application.RegistrosTrabajo.DomainEventHandlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Events;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class ActualizarEstadoOrdenHandlerTests
{
    private static (Mock<IOrdenRepository> repo, Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var repo = new Mock<IOrdenRepository>();
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (repo, uow);
    }

    [Fact]
    public async Task Handle_OrdenNoEncontrada_NoGuarda()
    {
        var (repo, uow) = BuildMocks();
        repo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Orden?)null);

        var handler = new ActualizarEstadoOrdenHandler(repo.Object);
        await handler.Handle(new ArticuloProgresoActualizadoDomainEvent(Guid.NewGuid(), Guid.NewGuid(), 50), CancellationToken.None);

        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_OrdenEncontrada_ActualizaEstadoYGuarda()
    {
        var (repo, uow) = BuildMocks();
        var ordenId = Guid.NewGuid();
        var orden = new Orden("ORD-001", "Orden de prueba");

        repo.Setup(r => r.GetByIdAsync(ordenId)).ReturnsAsync(orden);

        var handler = new ActualizarEstadoOrdenHandler(repo.Object);
        await handler.Handle(new ArticuloProgresoActualizadoDomainEvent(Guid.NewGuid(), ordenId, 100), CancellationToken.None);

        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
