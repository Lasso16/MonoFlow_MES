import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { OperationDataCard } from './OperationDataCard';

describe('Componente: OperationDataCard', () => {
  const baseProps = {
    operacion: undefined,
    progreso: undefined,
    registroActualOperacion: undefined,
    cliente: '',
    descripcionArticulo: '',
    // Pasamos un botón falso para simular el control de selección
    operationSelectorControl: <button>Cambiar Operación</button>,
  };

  it('Debería renderizar guiones (-) cuando no se le pasa ninguna operación', () => {
    render(<OperationDataCard {...baseProps} />);

    // Verifica que el componente inyectado por props se renderiza
    expect(screen.getByRole('button', { name: 'Cambiar Operación' })).toBeInTheDocument();

    // Como no hay operación, los chips deben mostrar el fallback "-"
    expect(screen.getByText('Producidas: -')).toBeInTheDocument();
    expect(screen.getByText('Rechazadas: -')).toBeInTheDocument();
  });

  it('Debería mostrar los datos y formatear las cantidades correctamente', () => {
    const props = {
      ...baseProps,
      cliente: 'Empresa ACME',
      descripcionArticulo: 'Tornillo de Titanio',
      operacion: {
        tipoOperacion: 'Ensamblaje',
        cantidadTotal: 5000,
        cantidadProducida: 2500,
        cantidadRechazada: 15,
        progreso: 50,
      } as any, // "as any" nos ahorra simular todas las propiedades irrelevantes
    };

    render(<OperationDataCard {...props} />);

    // Comprobamos los textos literales
    expect(screen.getByText('Empresa ACME')).toBeInTheDocument();
    expect(screen.getByText('Tornillo de Titanio')).toBeInTheDocument();
    expect(screen.getByText('Ensamblaje')).toBeInTheDocument();

    // Usamos Regex (/.../i) para ignorar si Node.js le pone el punto de los miles o no
    expect(screen.getByText(/5\.?000\s*Unidades/i)).toBeInTheDocument();
    expect(screen.getByText(/Producidas:\s*2\.?500/i)).toBeInTheDocument();
    expect(screen.getByText(/50\.00\s*%/i)).toBeInTheDocument();
  });

  it('Debería dar prioridad a progreso.porcentaje sobre operacion.progreso', () => {
    const props = {
      ...baseProps,
      operacion: { progreso: 10 } as any,
      // Si llegan ambos objetos, el componente debe pintar 75, no 10
      progreso: { porcentaje: 75 } as any, 
    };

    render(<OperationDataCard {...props} />);
    
    expect(screen.getByText('75.00%')).toBeInTheDocument();
  });

  it('Debería mostrar el Tooltip con el historial al pasar el ratón por el chip de producidas', async () => {
    // Iniciamos nuestro robot
    const user = userEvent.setup();
    
    const props = {
      ...baseProps,
      operacion: { cantidadProducida: 10 } as any,
      registroActualOperacion: {
        producciones: [
          // Tu componente admite los campos con mayúscula y minúscula, vamos a probarlo
          { cantidad: 5, timestamp: '2023-01-01T10:00:00' },
          { Cantidad: 5, Timestamp: '2023-01-01T15:30:00' } 
        ]
      } as any,
    };

    render(<OperationDataCard {...props} />);

    // 1. Buscamos el chip
    const chipProducidas = screen.getByText('Producidas: 10');
    
    // 2. Comprobamos que el Tooltip AÚN NO EXISTE en la pantalla
    expect(screen.queryByText('10:00:00')).toBeNull();

    // 3. El robot mueve el ratón encima del chip
    await user.hover(chipProducidas);

    // 4. CLAVE: Usamos findByText en lugar de getByText. 
    // findByText "espera" automáticamente hasta que la animación del Tooltip termine y aparezca.
    expect(await screen.findByText('10:00:00')).toBeInTheDocument();
    expect(await screen.findByText('15:30:00')).toBeInTheDocument();
  });
});