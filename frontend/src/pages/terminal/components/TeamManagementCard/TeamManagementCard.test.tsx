import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TeamManagementCard } from "./TeamManagementCard";

vi.mock("../../../../hooks/queries/useOperariosQueries", () => ({
  useGetOperarios: vi.fn(() => ({
    data: [
      {
        id: "2",
        nombre: "María López",
        numeroOperario: 1002,
        activo: true,
        rol: "Operario",
      },
      {
        id: "3",
        nombre: "Pedro García",
        numeroOperario: 1003,
        activo: true,
        rol: "Operario",
      },
    ],
    isLoading: false,
  })),
}));

vi.mock("../../../../hooks/queries/useRegistroTrabajoQueries", () => ({
  useGetRegistroActualOperacion: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useRegistroTrabajoMutations: vi.fn(() => ({
    cerrarSesionOperarioMutation: { mutate: vi.fn() },
    abrirRegistroTrabajoMutation: { mutate: vi.fn(), isPending: false },
  })),
}));

describe("Componente: TeamManagementCard", () => {
  const mockOnLockedChange = vi.fn();
  const mockOnSelectedOperariosChange = vi.fn();

  const baseProps = {
    operacionId: "OP-123",
    selectedOperarios: [
      {
        id: "1",
        nombre: "Juan Pérez",
        numeroOperario: 1001,
        activo: true,
        rol: "Operario",
      },
    ],
    onSelectedOperariosChange: mockOnSelectedOperariosChange,
    isLocked: false,
    hasProcesoIniciado: false,
    onLockedChange: mockOnLockedChange,
    canAddOperarios: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Debería pintar los operarios que le pasamos por la prop selectedOperarios", () => {
    render(<TeamManagementCard {...baseProps} />);

    expect(screen.getByText("1001 - Juan Pérez")).toBeInTheDocument();
  });

  it("Debería deshabilitar el input de búsqueda si canAddOperarios es false", () => {
    render(<TeamManagementCard {...baseProps} canAddOperarios={false} />);

    const input = screen.getByPlaceholderText("Buscar operario...");
    expect(input).toBeDisabled();
  });

  it("Debería filtrar operarios al escribir y permitir añadir uno desde el buscador", async () => {
    const user = userEvent.setup();
    render(
      <TeamManagementCard
        {...baseProps}
        operacionEstado="Pausada"
        selectedOperarios={[]}
      />,
    );

    const input = screen.getByPlaceholderText("Buscar operario...");
    await user.type(input, "María");

    expect(screen.getByText("1002 - María López")).toBeInTheDocument();
    expect(screen.queryByText("1003 - Pedro García")).toBeNull();

    await user.click(screen.getByText("1002 - María López"));

    expect(mockOnSelectedOperariosChange).toHaveBeenCalledWith([
      {
        id: "2",
        nombre: "María López",
        numeroOperario: 1002,
        activo: true,
        rol: "Operario",
      },
    ]);
  });

  it("Debería añadir por Enter cuando el texto coincide exactamente", async () => {
    const user = userEvent.setup();
    render(
      <TeamManagementCard
        {...baseProps}
        operacionEstado="Pausada"
        selectedOperarios={[]}
      />,
    );

    const input = screen.getByPlaceholderText("Buscar operario...");
    await user.type(input, "1002");
    await user.keyboard("{Enter}");

    expect(mockOnSelectedOperariosChange).toHaveBeenCalledWith([
      {
        id: "2",
        nombre: "María López",
        numeroOperario: 1002,
        activo: true,
        rol: "Operario",
      },
    ]);
  });

  it("Debería llamar a onLockedChange al pulsar el switch de bloqueo (candado)", async () => {
    const user = userEvent.setup();
    render(<TeamManagementCard {...baseProps} />);

    const candadoSwitch = screen.getByRole("checkbox", {
      name: "Bloquear gestion de equipo",
    });
    await user.click(candadoSwitch);

    expect(mockOnLockedChange).toHaveBeenCalledWith(true);
  });

  it("Debería pedir confirmación al añadir cuando el proceso ya está iniciado", async () => {
    const user = userEvent.setup();
    render(
      <TeamManagementCard
        {...baseProps}
        hasProcesoIniciado
        selectedOperarios={[]}
      />,
    );

    const input = screen.getByPlaceholderText("Buscar operario...");
    await user.type(input, "María");
    await user.click(screen.getByText("1002 - María López"));

    expect(mockOnSelectedOperariosChange).not.toHaveBeenCalled();
    expect(screen.getByText("¿Deseas añadir a María López al equipo activo?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(mockOnSelectedOperariosChange).toHaveBeenCalledWith([
      {
        id: "2",
        nombre: "María López",
        numeroOperario: 1002,
        activo: true,
        rol: "Operario",
      },
    ]);
  });

  it("No debería permitir añadir operarios cuando el equipo está bloqueado", () => {
    render(<TeamManagementCard {...baseProps} isLocked />);

    const input = screen.getByPlaceholderText("Buscar operario...");
    expect(input).toBeDisabled();
  });
});

