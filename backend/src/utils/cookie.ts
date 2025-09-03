import { Request, Response } from 'express';
import { env } from '../config/env';
import { StatusCode } from '../config/status-code';
import { AppError } from './app-error';

export function setCookie(
  res: Response,
  token: string,
  name: string,
  age: number
) {
  res.cookie(name, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: age * 1000,
    path: '/',
  });
}

export function getCookie(req: Request, name: string): string {
  const token = req.cookies[name];
  if (!token) {
    throw new AppError('No Token found', StatusCode.UNAUTHORIZED);
  }
  return token;
}

export function clearCookie(res: Response, names: string[]) {
  names.map((name) => {
    res.clearCookie(name);
  });
}
