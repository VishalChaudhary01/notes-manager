import { Request, Response, NextFunction } from 'express';
import { StatusCode } from '../config/status-code';
import { AppError } from '../utils/app-error';
import { ZodError } from 'zod';

export async function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`Error occured on PATH: ${req.path}`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => `${issue.message}`).join(', ');

    return res.status(StatusCode.BAD_REQUEST).json({ message });
  }

  return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: error?.message || 'Unknown error occurred',
  });
}
