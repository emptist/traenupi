import { querySafeText } from "./db-safe.js";

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

export async function resolveId(
  shortId: string,
  entityType: EntityType,
  options: ResolveOptions = {}
): Promise<ResolutionResult | null> {
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

  const result = await querySafeText(
    `SELECT ${config.idColumn} FROM ${config.table} WHERE ${config.idColumn}::text LIKE $1 LIMIT 10;`,
    [`${shortId}%`],
    { silent: options.silent ?? true }
  );

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

export async function resolveMeetingId(shortId: string): Promise<string | null> {
  const result = await resolveId(shortId, "meeting");
  return result?.id ?? null;
}

export async function resolveTaskId(shortId: string): Promise<string | null> {
  const result = await resolveId(shortId, "task");
  return result?.id ?? null;
}

export async function resolveIssueId(shortId: string): Promise<string | null> {
  const result = await resolveId(shortId, "issue");
  return result?.id ?? null;
}

export async function resolveAgentId(shortId: string): Promise<string | null> {
  const result = await resolveId(shortId, "agent");
  return result?.id ?? null;
}

export async function resolveOpinionId(shortId: string): Promise<string | null> {
  const result = await resolveId(shortId, "opinion");
  return result?.id ?? null;
}

export async function resolveSkillId(shortId: string): Promise<string | null> {
  const result = await resolveId(shortId, "skill");
  return result?.id ?? null;
}

export async function detectEntityType(
  shortId: string,
  options: ResolveOptions = {}
): Promise<ResolutionResult | null> {
  if (!validateShortId(shortId)) return null;

  if (shortId.length >= UUID_LENGTH) {
    for (const entityType of DETECTION_ORDER) {
      const config = ENTITY_TABLES[entityType];
      const result = await querySafeText(
        `SELECT ${config.idColumn} FROM ${config.table} WHERE ${config.idColumn}::text = $1 LIMIT 1;`,
        [shortId],
        { silent: true }
      );
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
    const result = await resolveId(shortId, entityType, {
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
