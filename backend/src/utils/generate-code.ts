import crypto from 'crypto';

export function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}
