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

public class CerrarSesionOperarioHandlerTests
{
    private static (
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<IOperarioRepository> operarioRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IArticuloRepository> articuloRepo,
        Mock<IOrdenRepository> ordenRepo,
        Mock<IUnitOfWork> uow) BuildMocks(bool savePasses = true)
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(savePasses);
        var registroRepo = new Mock<IRegistroTrabajoRepository>();
        registroRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        registroRepo.Setup(r => r.Update(It.IsAny<RegistroTrabajo>()));
        return (registroRepo, new Mock<IOperarioRepository>(), new Mock<IOperacionRepository>(), new Mock<IArticuloRepository>(), new Mock<IOrdenRepository>(), uow);
    }

    private static CerrarSesionOperarioHandler BuildHandler(
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<IOperarioRepository> operarioRepo,
        Mock<IOperacionRepository> operacionRepo,
        Mock<IArticuloRepository> articuloRepo,
        Mock<IOrdenRepository> ordenRepo)
        => new(registroRepo.Object, operarioRepo.Object, operacionRepo.Object, articuloRepo.Object, ordenRepo.Object);

    [Fact]
    public async Task Handle_OperarioNoEncontrado_ReturnsFail()
    {
        var (registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo, _) = BuildMocks();
        operarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Operario?)null);

        var handler = BuildHandler(registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo);
        var result = await handler.Handle(new CerrarSesionOperarioCommand { OperarioId = Guid.NewGuid() }, CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_SinSesionActiva_ReturnsFail()
    {
        var (registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo, _) = BuildMocks();
        operarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(Operario.Create(1, "Test"));
        registroRepo.Setup(r => r.GetRegistroConSesionActivaAsync(It.IsAny<Guid>())).ReturnsAsync((RegistroTrabajo?)null);

        var handler = BuildHandler(registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo);
        var result = await handler.Handle(new CerrarSesionOperarioCommand { OperarioId = Guid.NewGuid() }, CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_UltimoOperario_FinalizaRegistroYRetornaOk()
    {
        var (registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo, uow) = BuildMocks();

        // Operario.Create() produces Id = Guid.Empty (no EF Core); session must match
        var operario = Operario.Create(1, "Test");
        var registro = RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid> { operario.Id });

        operarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(operario);
        registroRepo.Setup(r => r.GetRegistroConSesionActivaAsync(operario.Id)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(registro.IdOperacion)).ReturnsAsync((Operacion?)null);

        var handler = BuildHandler(registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo);
        var result = await handler.Handle(new CerrarSesionOperarioCommand { OperarioId = Guid.NewGuid() }, CancellationToken.None);

        Assert.True(result.Success);
        Assert.True(registro.Finalizado);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_GuardaFalla_ReturnsFail()
    {
        var (registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo, _) = BuildMocks(savePasses: false);

        var operario = Operario.Create(1, "Test");
        var registro = RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid> { operario.Id });

        operarioRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(operario);
        registroRepo.Setup(r => r.GetRegistroConSesionActivaAsync(operario.Id)).ReturnsAsync(registro);
        operacionRepo.Setup(r => r.GetByIdWithRegistrosAsync(registro.IdOperacion)).ReturnsAsync((Operacion?)null);

        var handler = BuildHandler(registroRepo, operarioRepo, operacionRepo, articuloRepo, ordenRepo);
        var result = await handler.Handle(new CerrarSesionOperarioCommand { OperarioId = Guid.NewGuid() }, CancellationToken.None);

        Assert.False(result.Success);
    }
}
