import { describe, it, expect } from 'vitest';
import { formatOrdenEstado, getOrdenEstadoColor, ADMIN_ORDERS_PAGE_SIZE } from './adminOrdersUtils';

describe('ADMIN_ORDERS_PAGE_SIZE', () => {
  it('es 20', () => expect(ADMIN_ORDERS_PAGE_SIZE).toBe(20));
});

describe('formatOrdenEstado', () => {
  it('"0" → "Pendiente"', () => expect(formatOrdenEstado('0')).toBe('Pendiente'));
  it('"1" → "En curso"', () => expect(formatOrdenEstado('1')).toBe('En curso'));
  it('"2" → "Finalizada"', () => expect(formatOrdenEstado('2')).toBe('Finalizada'));
  it('undefined → "-"', () => expect(formatOrdenEstado(undefined)).toBe('-'));
  it('"texto libre" → "texto libre"', () => expect(formatOrdenEstado('otro')).toBe('otro'));
});

describe('getOrdenEstadoColor', () => {
  it('"0" → "warning"', () => expect(getOrdenEstadoColor('0')).toBe('warning'));
  it('"1" → "info"', () => expect(getOrdenEstadoColor('1')).toBe('info'));
  it('"2" → "success"', () => expect(getOrdenEstadoColor('2')).toBe('success'));
  it('null → "default"', () => expect(getOrdenEstadoColor(null)).toBe('default'));
  it('"Pendiente" → "warning"', () => expect(getOrdenEstadoColor('Pendiente')).toBe('warning'));
});
