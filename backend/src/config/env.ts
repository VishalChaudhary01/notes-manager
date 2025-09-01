import { getEnv } from '../utils/get-env';

export const env = {
  PORT: getEnv('PORT'),
} as const;
