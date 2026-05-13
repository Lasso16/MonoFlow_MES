export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

export interface AppError extends ProblemDetails {
  status: number;
  message: string;
  details?: unknown;
}