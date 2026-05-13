import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OperarioTimeline } from './OperarioTimeline';

describe('Componente: OperarioTimeline', () => {
  it('agrupa varias sesiones del mismo numero de operario en una sola fila', () => {
    render(
      <OperarioTimeline
        registro={{
          inicio: '2026-05-08T13:26:11.0232998',
          fin: '2026-05-11T09:03:40.896581',
          operarios: [
            {
              nombreOperario: 'Esther Simón',
              rol: 'Operario',
              inicio: '2026-05-08T13:26:19.7735075',
              fin: '2026-05-08T13:27:02.3919388',
              numeroOperario: 4,
            },
            {
              nombreOperario: 'Esther Simón',
              rol: 'Operario',
              inicio: '2026-05-08T13:27:16.6151598',
              fin: '2026-05-08T13:28:19.8877323',
              numeroOperario: 4,
            },
            {
              nombreOperario: 'Fran Ruiz',
              rol: 'Operario',
              inicio: '2026-05-11T08:57:06.7983939',
              fin: '2026-05-11T08:58:28.0880875',
              numeroOperario: 54,
            },
          ],
        }}
      />,
    );

    expect(screen.getAllByText('4 - Esther Simón')).toHaveLength(1);
    expect(screen.getByText('54 - Fran Ruiz')).toBeInTheDocument();
  });
});