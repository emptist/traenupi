export function getPort(): number {
  return parseInt(process.env.TRAENUPI_PORT || "5222", 10);
}

export function getNezhaApi(): string {
  return process.env.NEZHA_API || "http://127.0.0.1:5999";
}

export function getNupiCommand(): string {
  return process.env.TRAENUPI_NUPI_CMD || "nupi";
}

export function getPollInterval(): number {
  return parseInt(process.env.TRAENUPI_POLL_INTERVAL || "120000", 10);
}
