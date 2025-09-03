import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type TokenType = 'AUTH_TOKEN' | 'EMAIL_CONFIRM' | 'SIGNIN';

type Unit = 's' | 'm' | 'M' | 'h' | 'H' | 'd' | 'D';
type StringValues = `${number}${Unit}`;

export function signJWT(
  userId: string,
  type: TokenType,
  expiresIn: StringValues
) {
  return jwt.sign({ userId, type }, env.JWT_SECRET, {
    expiresIn,
  });
}

export function verifyJWT(token: string) {
  const payload = jwt.verify(token, env.JWT_SECRET) as {
    userId: string;
    type: TokenType;
  };

  return payload;
}
