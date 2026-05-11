import crypto from 'crypto';

export function computeHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}
