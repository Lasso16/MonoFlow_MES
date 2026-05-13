using MonoFlow.application.RegistrosTrabajo.DomainEventHandlers;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Events;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class ActualizarProgresoArticuloHandlerTests
{
    private static (Mock<IArticuloRepository> repo, Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var repo = new Mock<IArticuloRepository>();
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (repo, uow);
    }

    [Fact]
    public async Task Handle_ArticuloNoEncontrado_NoGuarda()
    {
        var (repo, uow) = BuildMocks();
        repo.Setup(r => r.GetByIdWithOperacionesAsync(It.IsAny<Guid>())).ReturnsAsync((Articulo?)null);

        var handler = new ActualizarProgresoArticuloHandler(repo.Object);
        await handler.Handle(new OperacionFinalizadaDomainEvent(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ArticuloEncontrado_ActualizaEstadoYGuarda()
    {
        var (repo, uow) = BuildMocks();

        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(5));
        var op = articulo.AgregarOperacion(1, Cantidad.Create(5));
        op.FinalizarOperacion();  // Estado = FinProduccion → articulo.CalcularEstado() = FINALIZADO

        repo.Setup(r => r.GetByIdWithOperacionesAsync(It.IsAny<Guid>())).ReturnsAsync(articulo);

        var handler = new ActualizarProgresoArticuloHandler(repo.Object);
        await handler.Handle(new OperacionFinalizadaDomainEvent(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.Equal(EstadoArticulo.FINALIZADO, articulo.CalcularEstado());
        Assert.Contains(articulo.DomainEvents, e => e is ArticuloProgresoActualizadoDomainEvent);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ArticuloConProgresoParcial_EmiteDomainEventConPorcentajeCorrecto()
    {
        var (repo, _) = BuildMocks();

        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(10));
        articulo.AgregarOperacion(1, Cantidad.Create(5));  // Pendiente (0% completada)
        var op2 = articulo.AgregarOperacion(2, Cantidad.Create(5));
        op2.FinalizarOperacion();  // FinProduccion → 1/2 = 50%

        repo.Setup(r => r.GetByIdWithOperacionesAsync(It.IsAny<Guid>())).ReturnsAsync(articulo);

        var handler = new ActualizarProgresoArticuloHandler(repo.Object);
        await handler.Handle(new OperacionFinalizadaDomainEvent(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        var eventoProgreso = articulo.DomainEvents
            .OfType<ArticuloProgresoActualizadoDomainEvent>()
            .Single();

        Assert.Equal(50, eventoProgreso.PorcentajeCompletado);
    }
}
