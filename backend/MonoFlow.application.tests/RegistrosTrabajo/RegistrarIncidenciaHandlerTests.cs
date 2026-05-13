using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class RegistrarIncidenciaHandlerTests
{
    private static (
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<ITipoIncidenciaRepository> tipoIncidenciaRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var registroRepo = new Mock<IRegistroTrabajoRepository>();
        registroRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        return (registroRepo, new Mock<ITipoIncidenciaRepository>(), new Mock<IOperacionRepository>(), uow);
    }

    [Fact]
    public async Task Handle_RegistroNoEncontrado_Throws()
    {
        var (registroRepo, tipoIncidenciaRepo, operacionRepo, _) = BuildMocks();
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(It.IsAny<Guid>()))
            .ReturnsAsync((RegistroTrabajo?)null);

        var handler = new RegistrarIncidenciaHandler(registroRepo.Object, tipoIncidenciaRepo.Object, operacionRepo.Object);

        await Assert.ThrowsAsync<Exception>(() =>
            handler.Handle(new RegistrarIncidenciaCommand(Guid.NewGuid(), 1, "prueba"), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_Exito_InsertaIncidenciaYDevuelveDTO()
    {
        var (registroRepo, tipoIncidenciaRepo, operacionRepo, uow) = BuildMocks();
        var operacionId = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(operacionId, new List<Guid>());

        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(operacionId)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdAsync(operacionId)).ReturnsAsync((Operacion?)null);
        tipoIncidenciaRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new TipoIncidencia("Averia"));

        var handler = new RegistrarIncidenciaHandler(registroRepo.Object, tipoIncidenciaRepo.Object, operacionRepo.Object);
        var result = await handler.Handle(new RegistrarIncidenciaCommand(operacionId, 1, "fallo maquina"), CancellationToken.None);

        Assert.Equal(1, result.IdTipoIncidencia);
        Assert.Equal("fallo maquina", result.Comentario);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
