import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Prisma hataları
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      status: 'error',
      message: 'Database işlem hatası',
    });
    return;
  }

  // Beklenmeyen hatalar
  console.error('UNEXPECTED ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Sunucu hatası',
  });
};