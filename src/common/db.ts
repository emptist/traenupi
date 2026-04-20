import { execSync } from "node:child_process";
import type { DbQueryOptions } from "./types.js";

export interface DbConfig {
  host?: string;
  user?: string;
  database?: string;
}

let dbConfig: DbConfig = {
  host: "localhost",
  user: "postgres",
  database: "nezha",
};

export function setDbConfig(config: Partial<DbConfig>): void {
  dbConfig = { ...dbConfig, ...config };
}

export function getDbConfig(): DbConfig {
  return { ...dbConfig };
}

function buildPsqlCommand(): string {
  return `psql -h ${dbConfig.host} -U ${dbConfig.user} -d ${dbConfig.database}`;
}

export function psqlQuery(sql: string, options?: DbQueryOptions): string {
  try {
    const escapedSql = sql.replace(/'/g, "'\"'\"'");
    const cmd = `${buildPsqlCommand()} -t -A -c '${escapedSql}'`;
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
    const escapedSql = sql.replace(/'/g, "'\"'\"'");
    const cmd = `${buildPsqlCommand()} -c '${escapedSql}'`;
    execSync(cmd, {
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

export function getAgentId(prefix: string = "S-TRAE"): string {
  try {
    const result = execSync("nezha agents id", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    const lines = result.split("\n").filter(
      l => l.trim() && !l.includes("[INFO]") && !l.includes("[WARN]") && !l.includes("[ERROR]")
    );
    return lines[lines.length - 1]?.trim() || `${prefix}-${Date.now().toString(36)}`;
  } catch {
    return `${prefix}-${Date.now().toString(36)}`;
  }
}

export function resolveMeetingId(meetingId: string): string | null {
  if (meetingId.length >= 36) return meetingId;
  try {
    const result = psqlQuery(`SELECT id FROM meetings WHERE id::text LIKE '${meetingId}%';`);
    return result || null;
  } catch {
    return null;
  }
}

export function queryOne<T>(sql: string, mapper: (row: string) => T): T | null {
  const result = psqlQuery(sql);
  if (!result) return null;
  return mapper(result);
}

export function queryMany<T>(sql: string, mapper: (row: string) => T): T[] {
  const result = psqlQuery(sql);
  if (!result) return [];
  return result.split("\n").filter(Boolean).map(mapper);
}
