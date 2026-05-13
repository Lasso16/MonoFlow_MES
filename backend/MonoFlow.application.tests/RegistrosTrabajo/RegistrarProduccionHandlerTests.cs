using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class RegistrarProduccionHandlerTests
{
    private static RegistroTrabajo CrearRegistroEnEjecucion(Guid operacionId)
    {
        var registro = RegistroTrabajo.Create(operacionId, new List<Guid>());
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);
        return registro;
    }

    private static (Mock<IRegistroTrabajoRepository> registroRepo, Mock<IOperacionRepository> operacionRepo, Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var registroRepo = new Mock<IRegistroTrabajoRepository>();
        registroRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (registroRepo, new Mock<IOperacionRepository>(), uow);
    }

    [Fact]
    public async Task Handle_RegistroNoEncontrado_Throws()
    {
        var (registroRepo, operacionRepo, _) = BuildMocks();
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(It.IsAny<Guid>())).ReturnsAsync((RegistroTrabajo?)null);

        var handler = new RegistrarProduccionHandler(registroRepo.Object, operacionRepo.Object);

        await Assert.ThrowsAsync<Exception>(() =>
            handler.Handle(new RegistrarProduccionCommand { idOperacion = Guid.NewGuid(), Cantidad = 1 }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_CantidadSuperaCapacidad_Throws()
    {
        var (registroRepo, operacionRepo, _) = BuildMocks();
        var operacionId = Guid.NewGuid();

        var registro = CrearRegistroEnEjecucion(operacionId);
        registro.RegistrarProduccion(Cantidad.Create(3));

        var operacion = new Operacion(Guid.NewGuid(), 1, Cantidad.Create(5));
        operacion.AgregarRegistro(registro);

        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(operacionId)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(operacionId)).ReturnsAsync(operacion);

        var handler = new RegistrarProduccionHandler(registroRepo.Object, operacionRepo.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new RegistrarProduccionCommand { idOperacion = operacionId, Cantidad = 3 }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_Exito_RegistraProduccionYGuarda()
    {
        var (registroRepo, operacionRepo, uow) = BuildMocks();
        var operacionId = Guid.NewGuid();

        var registro = CrearRegistroEnEjecucion(operacionId);
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(operacionId)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(operacionId)).ReturnsAsync((Operacion?)null);

        var handler = new RegistrarProduccionHandler(registroRepo.Object, operacionRepo.Object);
        var result = await handler.Handle(new RegistrarProduccionCommand { idOperacion = operacionId, Cantidad = 2 }, CancellationToken.None);

        Assert.Equal(2, result.Cantidad);
        Assert.Equal(Cantidad.Create(2), registro.TotalProducidoOk);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
