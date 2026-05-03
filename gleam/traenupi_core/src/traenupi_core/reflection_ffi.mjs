export function now() {
  return Math.floor(Date.now() / 1000);
}

export function generate_uuid() {
  return crypto.randomUUID();
}
