using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.RegistrosTrabajo.Handlers;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.application.tests.Helpers;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.SesionesOperarios;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.RegistrosTrabajo;

public class GetRegistroActivoOperarioHandlerTests
{
    private static Mock<IAppDbContext> BuildContext(
        IEnumerable<SesionOperario> sesiones,
        IEnumerable<RegistroTrabajo> registros)
    {
        var ctx = new Mock<IAppDbContext>();
        ctx.Setup(c => c.SesionesOperarioRead).Returns(DbSetMock.Create(sesiones));
        ctx.Setup(c => c.RegistrosTrabajoRead).Returns(DbSetMock.Create(registros));
        return ctx;
    }

    [Fact]
    public async Task Handle_SinSesionActiva_DevuelveNull()
    {
        var ctx = BuildContext(Array.Empty<SesionOperario>(), Array.Empty<RegistroTrabajo>());
        var result = await new GetRegistroActivoOperarioHandler(ctx.Object)
            .Handle(new GetRegistroActivoOperarioQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_ConSesionActiva_DevuelveDTO()
    {
        var operarioId = Guid.NewGuid();
        var operacionId = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(operacionId, new List<Guid>());
        var sesion = new SesionOperario(registro.Id, operarioId);

        var ctx = BuildContext(new[] { sesion }, new[] { registro });
        var result = await new GetRegistroActivoOperarioHandler(ctx.Object)
            .Handle(new GetRegistroActivoOperarioQuery(operarioId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(registro.Id, result.IdRegistro);
        Assert.Equal(operacionId, result.IdOperacion);
    }

    [Fact]
    public async Task Handle_SesionDeOtroOperario_DevuelveNull()
    {
        var operarioA = Guid.NewGuid();
        var operarioB = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid>());
        var sesion = new SesionOperario(registro.Id, operarioA);

        var ctx = BuildContext(new[] { sesion }, new[] { registro });
        var result = await new GetRegistroActivoOperarioHandler(ctx.Object)
            .Handle(new GetRegistroActivoOperarioQuery(operarioB), CancellationToken.None);

        Assert.Null(result);
    }
}
