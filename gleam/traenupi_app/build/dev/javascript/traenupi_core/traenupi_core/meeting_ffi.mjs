import { randomUUID } from 'crypto';

export function generate_id() {
  return randomUUID();
}

export function now() {
  return Math.floor(Date.now() / 1000);
}
