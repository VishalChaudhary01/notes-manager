import { getEnv } from '../utils/get-env';

export const env = {
  PORT: getEnv('PORT'),
  NODE_ENV: getEnv('NODE_ENV'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  VERIFICATION_COOKIE: getEnv('VERIFICATION_COOKIE'),
  AUTH_COOKIE_NAME: getEnv('AUTH_COOKIE_NAME'),
} as const;
