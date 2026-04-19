import { execSync } from "node:child_process";

const PSQL = "psql -h localhost -U postgres -d nezha";

export interface DbQueryOptions {
  timeout?: number;
  silent?: boolean;
}

export function psqlQuery(sql: string, options?: DbQueryOptions): string {
  try {
    const cmd = `${PSQL} -t -A -c ${sql}`;
    return execSync(cmd, {
      encoding: "utf-8",
      timeout: options?.timeout ?? 5000,
    }).trim();
  } catch (e) {
    if (!options?.silent) {
      console.error(`[PSQL Error] ${e instanceof Error ? e.message : String(e)}`);
    }
    return "";
  }
}

export function psqlExec(sql: string, options?: DbQueryOptions): boolean {
  try {
    execSync(`${PSQL} -c "${sql}"`, {
      encoding: "utf-8",
      timeout: options?.timeout ?? 5000,
    });
    return true;
  } catch (e) {
    if (!options?.silent) {
      console.error(`[PSQL Error] ${e instanceof Error ? e.message : String(e)}`);
    }
    return false;
  }
}

export function getAgentId(): string {
  try {
    const result = execSync("nezha agents id", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    return result || `S-TRAE-traenupi-${Date.now().toString(36)}`;
  } catch {
    return `S-TRAE-traenupi-${Date.now().toString(36)}`;
  }
}

export function resolveMeetingId(meetingId: string): string | null {
  if (meetingId.length >= 36) return meetingId;
  try {
    const result = psqlQuery(`"SELECT id FROM meetings WHERE id::text LIKE '${meetingId}%';"`);
    return result || null;
  } catch {
    return null;
  }
}
