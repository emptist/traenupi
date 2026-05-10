export function systemTime() {
  return Date.now();
}

export function getEnv(key) {
  return process.env[key] || "";
}
