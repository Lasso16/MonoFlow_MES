using MonoFlow.application.Common;
using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.Handlers;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class AbrirRegistroTrabajoHandlerTests
{
    private static readonly Guid OperacionId = Guid.NewGuid();
    private static readonly Guid OperarioId = Guid.NewGuid();

    private static (
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<IArticuloRepository> articuloRepo,
        Mock<IOperarioRepository> operarioRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IOrdenRepository> ordenRepo,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var operacionRepo = new Mock<IOperacionRepository>();
        operacionRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);

        return (
            new Mock<IRegistroTrabajoRepository>(),
            new Mock<IArticuloRepository>(),
            new Mock<IOperarioRepository>(),
            operacionRepo,
            new Mock<IOrdenRepository>(),
            uow);
    }

    private static AbrirRegistroTrabajoHandler BuildHandler(
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<IArticuloRepository> articuloRepo,
        Mock<IOperarioRepository> operarioRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IOrdenRepository> ordenRepo)
        => new(registroRepo.Object, articuloRepo.Object, operarioRepo.Object, operacionRepo.Object, ordenRepo.Object);

    [Fact]
    public async Task Handle_OperacionNoEncontrada_ReturnsFail()
    {
        var (registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo, _) = BuildMocks();
        operacionRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Operacion?)null);

        var handler = BuildHandler(registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo);
        var result = await handler.Handle(new AbrirRegistroTrabajoCommand { OperacionId = OperacionId }, CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_OperarioNoEncontrado_ReturnsFail()
    {
        var (registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo, _) = BuildMocks();
        operacionRepo.Setup(r => r.GetByIdAsync(OperacionId)).ReturnsAsync(new Operacion(Guid.NewGuid(), 1, Cantidad.Create(5)));
        operarioRepo.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>())).ReturnsAsync(new List<Operario>());

        var handler = BuildHandler(registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo);
        var result = await handler.Handle(
            new AbrirRegistroTrabajoCommand { OperacionId = OperacionId, IdOperarios = new List<Guid> { OperarioId } },
            CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_OperarioConSesionAbierta_ReturnsFail()
    {
        var (registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo, _) = BuildMocks();
        operacionRepo.Setup(r => r.GetByIdAsync(OperacionId)).ReturnsAsync(new Operacion(Guid.NewGuid(), 1, Cantidad.Create(5)));
        operarioRepo.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>())).ReturnsAsync(new List<Operario> { Operario.Create(1, "Test") });
        operarioRepo.Setup(r => r.HasSesionesAsync(It.IsAny<Guid>())).ReturnsAsync(true);

        var handler = BuildHandler(registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo);
        var result = await handler.Handle(
            new AbrirRegistroTrabajoCommand { OperacionId = OperacionId, IdOperarios = new List<Guid> { OperarioId } },
            CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task AbrirRegistro_ConRegistroYaAbierto_AgregaOperarioAlRegistroExistente_RetornaOk()
    {
        var (registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo, uow) = BuildMocks();
        var operario = Operario.Create(1, "Test");
        operacionRepo.Setup(r => r.GetByIdAsync(OperacionId)).ReturnsAsync(new Operacion(Guid.NewGuid(), 1, Cantidad.Create(5)));
        operarioRepo.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>())).ReturnsAsync(new List<Operario> { operario });
        operarioRepo.Setup(r => r.HasSesionesAsync(It.IsAny<Guid>())).ReturnsAsync(false);
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(OperacionId))
            .ReturnsAsync(RegistroTrabajo.Create(OperacionId, new List<Guid>()));

        var handler = BuildHandler(registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo);
        var result = await handler.Handle(
            new AbrirRegistroTrabajoCommand { OperacionId = OperacionId, IdOperarios = new List<Guid> { operario.Id } },
            CancellationToken.None);

        Assert.True(result.Success);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NuevoRegistro_GuardaYDevuelveOk()
    {
        var (registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo, uow) = BuildMocks();
        // Operario.Create() produces Id = Guid.Empty — command must use the same ID
        var operario = Operario.Create(1, "Test");
        operacionRepo.Setup(r => r.GetByIdAsync(OperacionId)).ReturnsAsync(new Operacion(Guid.NewGuid(), 1, Cantidad.Create(5)));
        operarioRepo.Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>())).ReturnsAsync(new List<Operario> { operario });
        operarioRepo.Setup(r => r.HasSesionesAsync(It.IsAny<Guid>())).ReturnsAsync(false);
        registroRepo.Setup(r => r.GetRegistroActivoPorOperacionAsync(OperacionId)).ReturnsAsync((RegistroTrabajo?)null);
        articuloRepo.Setup(r => r.GetByIdWithOperacionesAsync(It.IsAny<Guid>())).ReturnsAsync((Articulo?)null);
        ordenRepo.Setup(r => r.GetOrdenByArticuloIdAsync(It.IsAny<Guid>())).ReturnsAsync((Orden?)null);

        var handler = BuildHandler(registroRepo, articuloRepo, operarioRepo, operacionRepo, ordenRepo);
        var result = await handler.Handle(
            new AbrirRegistroTrabajoCommand { OperacionId = OperacionId, IdOperarios = new List<Guid> { operario.Id } },
            CancellationToken.None);

        Assert.True(result.Success);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
