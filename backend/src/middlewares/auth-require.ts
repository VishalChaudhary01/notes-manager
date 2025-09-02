import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';
import { StatusCode } from '../config/status-code';
import jwt from 'jsonwebtoken';

export async function authRequire(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies[env.AUTH_COOKIE_NAME];
    if (!token) {
      throw new AppError('No token found', StatusCode.FORBIDDEN);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
    };

    const { userId } = decoded;
    if (!userId) {
      throw new AppError('Invalid  token', StatusCode.BAD_REQUEST);
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
}
