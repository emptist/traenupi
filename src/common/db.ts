import { execSync } from "node:child_process";
import type { DbQueryOptions } from "./types.js";
import { resolveMeetingId as resolveMeetingIdImpl } from "./resolve-id.js";
import { resolveAgentIdentity } from "./identity-gleam.js";

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

/**
 * @deprecated Use querySafe from db-safe.ts instead. This function is vulnerable to SQL injection.
 * @see db-safe.ts for secure parameterized queries
 */
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

/**
 * @deprecated Use execSafe from db-safe.ts instead. This function is vulnerable to SQL injection.
 * @see db-safe.ts for secure parameterized queries
 */
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
    const identity = resolveAgentIdentity();
    return identity.id;
  } catch {
    return `${prefix}-${Date.now().toString(36)}`;
  }
}

export function resolveMeetingId(meetingId: string): string | null {
  return resolveMeetingIdImpl(meetingId);
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
