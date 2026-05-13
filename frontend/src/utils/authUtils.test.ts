import { describe, it, expect, beforeEach } from 'vitest';
import { readAdminSession, saveAdminSession, clearAdminSession } from './authUtils';

const KEY = 'monoflow.admin.session';

const validAdmin = {
  id: 'u1',
  nombre: 'Admin User',
  numeroOperario: 1,
  activo: true,
  rol: 'Admin',
};

beforeEach(() => localStorage.clear());

describe('readAdminSession', () => {
  it('null si localStorage vacío', () => {
    expect(readAdminSession()).toBeNull();
  });

  it('null si JSON inválido', () => {
    localStorage.setItem(KEY, 'no-json');
    expect(readAdminSession()).toBeNull();
  });

  it('null si rol no es admin', () => {
    localStorage.setItem(KEY, JSON.stringify({ ...validAdmin, rol: 'Operario' }));
    expect(readAdminSession()).toBeNull();
  });

  it('null si numeroOperario no es número finito', () => {
    localStorage.setItem(KEY, JSON.stringify({ ...validAdmin, numeroOperario: NaN }));
    expect(readAdminSession()).toBeNull();
  });

  it('null si nombre vacío', () => {
    localStorage.setItem(KEY, JSON.stringify({ ...validAdmin, nombre: '' }));
    expect(readAdminSession()).toBeNull();
  });

  it('rol con acentos normalizado → válido', () => {
    localStorage.setItem(KEY, JSON.stringify({ ...validAdmin, rol: 'Ádmin' }));
    expect(readAdminSession()).not.toBeNull();
  });

  it('devuelve objeto si sesión válida', () => {
    localStorage.setItem(KEY, JSON.stringify(validAdmin));
    const result = readAdminSession();
    expect(result?.nombre).toBe('Admin User');
    expect(result?.numeroOperario).toBe(1);
  });
});

describe('saveAdminSession', () => {
  it('guarda operario en localStorage', () => {
    saveAdminSession(validAdmin as any);
    const raw = localStorage.getItem(KEY);
    expect(JSON.parse(raw!).nombre).toBe('Admin User');
  });
});

describe('clearAdminSession', () => {
  it('elimina clave de localStorage', () => {
    localStorage.setItem(KEY, JSON.stringify(validAdmin));
    clearAdminSession();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
