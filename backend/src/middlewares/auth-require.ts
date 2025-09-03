import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';
import { StatusCode } from '../config/status-code';
import { JsonWebTokenError } from 'jsonwebtoken';
import { getCookie } from '../utils/cookie';
import { verifyJWT } from '../utils/jwt';

export async function authRequire(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = getCookie(req, env.AUTH_COOKIE_NAME);

    const { userId } = verifyJWT(token);

    if (!userId) {
      throw new AppError('Invalid or expired token', StatusCode.UNAUTHORIZED);
    }

    req.userId = userId;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new AppError('Invalid or expired token', StatusCode.UNAUTHORIZED);
    }
    next(error);
  }
}
