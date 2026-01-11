// src/utils/appError.ts
export class AppError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export const badRequestError = (message: string, code?: string) =>
  new AppError(message, 400, code);

export const notFoundError = (message: string, code?: string) =>
  new AppError(message, 404, code);

export const conflictError = (message: string, code?: string) =>
  new AppError(message, 409, code);
