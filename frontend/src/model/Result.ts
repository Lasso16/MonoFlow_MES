import { type ProblemDetails } from "./aggregates/ProblemDetails";

export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error?: string | ProblemDetails;
  private _value?: T;

  private constructor(isSuccess: boolean, error?: string | ProblemDetails, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public get value(): T {
    if (!this.isSuccess) throw new Error("No se puede acceder al valor de un error.");
    return this._value as T;
  }

  public static success<U>(value: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static failure<U>(error: string | ProblemDetails): Result<U> {
    return new Result<U>(false, error);
  }
}