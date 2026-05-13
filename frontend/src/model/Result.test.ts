import { describe, it, expect } from 'vitest';
import { Result } from './Result';

describe('Result monad', () => {
  it('success: isSuccess=true, isFailure=false', () => {
    const r = Result.success(42);

    expect(r.isSuccess).toBe(true);
    expect(r.isFailure).toBe(false);
  });

  it('success: value devuelve el valor', () => {
    const r = Result.success({ id: 'X' });

    expect(r.value).toEqual({ id: 'X' });
  });

  it('failure: isSuccess=false, isFailure=true', () => {
    const r = Result.failure('error mensaje');

    expect(r.isSuccess).toBe(false);
    expect(r.isFailure).toBe(true);
  });

  it('failure: error guarda el mensaje', () => {
    const r = Result.failure<string>('algo falló');

    expect(r.error).toBe('algo falló');
  });

  it('failure: acceder a value lanza excepción', () => {
    const r = Result.failure<number>('bad');

    expect(() => r.value).toThrow('No se puede acceder al valor de un error.');
  });

  it('success con undefined es válido', () => {
    const r = Result.success(undefined);

    expect(r.isSuccess).toBe(true);
    expect(r.value).toBeUndefined();
  });

  it('failure con ProblemDetails guarda el objeto', () => {
    const pd = { title: 'Error', detail: 'detalle', message: 'msg' };
    const r = Result.failure(pd);

    expect(r.error).toEqual(pd);
  });
});
