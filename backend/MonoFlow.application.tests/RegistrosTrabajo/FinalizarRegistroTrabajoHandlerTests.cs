using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.Handlers;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class FinalizarRegistroTrabajoHandlerTests
{
    private static (
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IArticuloRepository> articuloRepo,
        Mock<IOrdenRepository> ordenRepo,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var registroRepo = new Mock<IRegistroTrabajoRepository>();
        registroRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (registroRepo, new Mock<IOperacionRepository>(), new Mock<IArticuloRepository>(), new Mock<IOrdenRepository>(), uow);
    }

    [Fact]
    public async Task Handle_RegistroNoEncontrado_Throws()
    {
        var (registroRepo, operacionRepo, articuloRepo, ordenRepo, _) = BuildMocks();
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(It.IsAny<Guid>()))
            .ReturnsAsync((RegistroTrabajo?)null);

        var handler = new FinalizarRegistroTrabajoHandler(registroRepo.Object, operacionRepo.Object, articuloRepo.Object, ordenRepo.Object);

        await Assert.ThrowsAsync<Exception>(() =>
            handler.Handle(new FinalizarRegistroTrabajoCommand { OperacionId = Guid.NewGuid() }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_Exito_FinalizaRegistroYGuarda()
    {
        var (registroRepo, operacionRepo, articuloRepo, ordenRepo, uow) = BuildMocks();
        var operacionId = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(operacionId, new List<Guid>());

        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(operacionId)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(operacionId)).ReturnsAsync((Operacion?)null);

        var handler = new FinalizarRegistroTrabajoHandler(registroRepo.Object, operacionRepo.Object, articuloRepo.Object, ordenRepo.Object);
        var result = await handler.Handle(new FinalizarRegistroTrabajoCommand { OperacionId = operacionId }, CancellationToken.None);

        Assert.True(result);
        Assert.True(registro.Finalizado);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
