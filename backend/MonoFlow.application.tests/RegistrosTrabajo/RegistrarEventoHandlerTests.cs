using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class RegistrarEventoHandlerTests
{
    private static (
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<ITipoEventoRepository> tipoEventoRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var registroRepo = new Mock<IRegistroTrabajoRepository>();
        registroRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (registroRepo, new Mock<ITipoEventoRepository>(), new Mock<IOperacionRepository>(), uow);
    }

    [Fact]
    public async Task Handle_RegistroNoEncontrado_Throws()
    {
        var (registroRepo, tipoEventoRepo, operacionRepo, _) = BuildMocks();
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(It.IsAny<Guid>()))
            .ReturnsAsync((RegistroTrabajo?)null);

        var handler = new RegistrarEventoHandler(registroRepo.Object, tipoEventoRepo.Object, operacionRepo.Object);

        await Assert.ThrowsAsync<Exception>(() =>
            handler.Handle(new RegistrarEventoCommand(Guid.NewGuid(), TiposEventoEstandar.Pausa), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_Exito_RegistraEventoYDevuelveDTO()
    {
        var (registroRepo, tipoEventoRepo, operacionRepo, uow) = BuildMocks();
        var operacionId = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(operacionId, new List<Guid>());

        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(operacionId)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdAsync(operacionId)).ReturnsAsync((Operacion?)null);
        tipoEventoRepo.Setup(r => r.GetByIdAsync(TiposEventoEstandar.Pausa)).ReturnsAsync(new TipoEvento("Pausa"));

        var handler = new RegistrarEventoHandler(registroRepo.Object, tipoEventoRepo.Object, operacionRepo.Object);
        var result = await handler.Handle(new RegistrarEventoCommand(operacionId, TiposEventoEstandar.Pausa), CancellationToken.None);

        Assert.Equal(TiposEventoEstandar.Pausa, result.IdTipoEvento);
        Assert.Equal(2, registro.Eventos.Count);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
