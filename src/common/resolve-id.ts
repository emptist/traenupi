import { psqlQuery } from "./db.js";

export type EntityType =
  | "meeting"
  | "task"
  | "issue"
  | "agent"
  | "opinion"
  | "skill"
  | "memory"
  | "inter_review";

export interface ResolutionResult {
  id: string;
  entityType: EntityType;
  ambiguous: boolean;
  matches: number;
}

interface EntityTableConfig {
  table: string;
  idColumn: string;
}

const ENTITY_TABLES: Record<EntityType, EntityTableConfig> = {
  meeting: { table: "meetings", idColumn: "id" },
  task: { table: "tasks", idColumn: "id" },
  issue: { table: "issues", idColumn: "id" },
  agent: { table: "agent_identity", idColumn: "id" },
  opinion: { table: "meeting_opinions", idColumn: "id" },
  skill: { table: "skills", idColumn: "id" },
  memory: { table: "memory", idColumn: "id" },
  inter_review: { table: "inter_reviews", idColumn: "id" },
};

const DETECTION_ORDER: EntityType[] = [
  "meeting",
  "task",
  "issue",
  "agent",
  "opinion",
  "skill",
  "memory",
  "inter_review",
];

const MIN_SHORT_ID_LENGTH = 4;
const UUID_LENGTH = 36;

export function validateShortId(id: string): boolean {
  if (!id || id.length < MIN_SHORT_ID_LENGTH) return false;
  const cleaned = id.replace(/-/g, "");
  return /^[0-9a-fA-F]+$/.test(cleaned);
}

export interface ResolveOptions {
  allowAmbiguous?: boolean;
  silent?: boolean;
}

export function resolveId(
  shortId: string,
  entityType: EntityType,
  options: ResolveOptions = {}
): ResolutionResult | null {
  if (!validateShortId(shortId)) return null;

  if (shortId.length >= UUID_LENGTH) {
    return {
      id: shortId,
      entityType,
      ambiguous: false,
      matches: 1,
    };
  }

  const config = ENTITY_TABLES[entityType];
  if (!config) return null;

  const sql = `SELECT ${config.idColumn} FROM ${config.table} WHERE ${config.idColumn}::text LIKE '${shortId}%' LIMIT 10;`;
  const result = psqlQuery(sql, { silent: options.silent ?? true });

  if (!result) return null;

  const rows = result.split("\n").filter(Boolean);
  const matchCount = rows.length;

  if (matchCount === 0) return null;

  if (matchCount > 1 && !options.allowAmbiguous) return null;

  return {
    id: rows[0],
    entityType,
    ambiguous: matchCount > 1,
    matches: matchCount,
  };
}

export function resolveMeetingId(shortId: string): string | null {
  const result = resolveId(shortId, "meeting");
  return result?.id ?? null;
}

export function resolveTaskId(shortId: string): string | null {
  const result = resolveId(shortId, "task");
  return result?.id ?? null;
}

export function resolveIssueId(shortId: string): string | null {
  const result = resolveId(shortId, "issue");
  return result?.id ?? null;
}

export function resolveAgentId(shortId: string): string | null {
  const result = resolveId(shortId, "agent");
  return result?.id ?? null;
}

export function resolveOpinionId(shortId: string): string | null {
  const result = resolveId(shortId, "opinion");
  return result?.id ?? null;
}

export function resolveSkillId(shortId: string): string | null {
  const result = resolveId(shortId, "skill");
  return result?.id ?? null;
}

export function detectEntityType(
  shortId: string,
  options: ResolveOptions = {}
): ResolutionResult | null {
  if (!validateShortId(shortId)) return null;

  if (shortId.length >= UUID_LENGTH) {
    for (const entityType of DETECTION_ORDER) {
      const config = ENTITY_TABLES[entityType];
      const sql = `SELECT ${config.idColumn} FROM ${config.table} WHERE ${config.idColumn}::text = '${shortId}' LIMIT 1;`;
      const result = psqlQuery(sql, { silent: true });
      if (result) {
        return {
          id: shortId,
          entityType,
          ambiguous: false,
          matches: 1,
        };
      }
    }
    return null;
  }

  for (const entityType of DETECTION_ORDER) {
    const result = resolveId(shortId, entityType, {
      ...options,
      allowAmbiguous: true,
    });
    if (result && result.matches === 1) {
      return { ...result, ambiguous: false };
    }
    if (result && result.matches > 1) {
      return result;
    }
  }

  return null;
}
