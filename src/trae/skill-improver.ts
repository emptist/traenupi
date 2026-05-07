import { querySafeText, execSafe } from "../common/db-safe.js";

export interface SkillRecord {
  id: string;
  name: string;
  description: string | null;
  trigger_phrases: string[] | null;
  anti_patterns: string[] | null;
  quick_start: string | null;
  examples: string[] | null;
  content: Record<string, unknown> | null;
  instructions: string | null;
  category: string | null;
  tags: string[] | null;
}

export interface SkillGap {
  field: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  autoFixable: boolean;
}

export interface SkillScanResult {
  skill: SkillRecord;
  score: number;
  gaps: SkillGap[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "about", "up",
  "that", "this", "these", "those", "it", "its", "also",
]);

const FIELD_WEIGHTS: Record<string, number> = {
  name: 15,
  description: 15,
  trigger_phrases: 15,
  content: 10,
  instructions: 10,
  quick_start: 8,
  examples: 8,
  category: 5,
  tags: 7,
  anti_patterns: 7,
};

export function scoreSkillCompleteness(skill: SkillRecord): number {
  let score = 0;

  if (skill.name && skill.name.trim()) score += FIELD_WEIGHTS.name;
  if (skill.description && skill.description.trim()) score += FIELD_WEIGHTS.description;
  if (skill.trigger_phrases && skill.trigger_phrases.length > 0) score += FIELD_WEIGHTS.trigger_phrases;
  if (skill.content && Object.keys(skill.content).length > 0) score += FIELD_WEIGHTS.content;
  if (skill.instructions && skill.instructions.trim()) score += FIELD_WEIGHTS.instructions;
  if (skill.quick_start && skill.quick_start.trim()) score += FIELD_WEIGHTS.quick_start;
  if (skill.examples && skill.examples.length > 0) score += FIELD_WEIGHTS.examples;
  if (skill.category && skill.category.trim()) score += FIELD_WEIGHTS.category;
  if (skill.tags && skill.tags.length > 0) score += FIELD_WEIGHTS.tags;
  if (skill.anti_patterns && skill.anti_patterns.length > 0) score += FIELD_WEIGHTS.anti_patterns;

  return score;
}

export function identifyGaps(skill: SkillRecord): SkillGap[] {
  const gaps: SkillGap[] = [];

  if (!skill.name || !skill.name.trim()) {
    gaps.push({ field: "name", severity: "critical", message: "Skill name is missing", autoFixable: false });
  }

  if (!skill.description || !skill.description.trim()) {
    gaps.push({ field: "description", severity: "critical", message: "Description is missing", autoFixable: true });
  }

  if (!skill.trigger_phrases || skill.trigger_phrases.length === 0) {
    gaps.push({ field: "trigger_phrases", severity: "high", message: "No trigger phrases defined", autoFixable: true });
  }

  if (!skill.content || Object.keys(skill.content).length === 0) {
    gaps.push({ field: "content", severity: "high", message: "Skill content is empty", autoFixable: true });
  }

  if (!skill.instructions || !skill.instructions.trim()) {
    gaps.push({ field: "instructions", severity: "medium", message: "Instructions are missing", autoFixable: true });
  }

  if (!skill.quick_start || !skill.quick_start.trim()) {
    gaps.push({ field: "quick_start", severity: "medium", message: "Quick start guide is missing", autoFixable: true });
  }

  if (!skill.examples || skill.examples.length === 0) {
    gaps.push({ field: "examples", severity: "medium", message: "No usage examples provided", autoFixable: true });
  }

  if (!skill.category || !skill.category.trim()) {
    gaps.push({ field: "category", severity: "low", message: "Category is not set", autoFixable: true });
  }

  if (!skill.tags || skill.tags.length === 0) {
    gaps.push({ field: "tags", severity: "low", message: "No tags defined", autoFixable: true });
  }

  if (!skill.anti_patterns || skill.anti_patterns.length === 0) {
    gaps.push({ field: "anti_patterns", severity: "low", message: "No anti-patterns defined", autoFixable: true });
  }

  return gaps;
}

export function extractKeywords(name: string, description?: string): string[] {
  const parts: string[] = [];

  if (name) {
    parts.push(...name.split(/[-_\s]+/));
  }
  if (description) {
    parts.push(...description.split(/\s+/));
  }

  const keywords = parts
    .map(p => p.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(p => p.length > 1 && !STOP_WORDS.has(p));

  return [...new Set(keywords)];
}

export function generateTriggerPhrases(skill: SkillRecord): string[] {
  const existing = skill.trigger_phrases ?? [];
  const fromName = extractKeywords(skill.name);
  const fromDesc = skill.description ? extractKeywords("", skill.description) : [];
  const fromTags = skill.tags ?? [];

  const allPhrases = [...existing, ...fromName, ...fromDesc, ...fromTags];
  return [...new Set(allPhrases)];
}

export async function scanSkills(projectId: string = "traenupi"): Promise<SkillScanResult[]> {
  const output = await querySafeText(
    "SELECT id, name, description, trigger_phrases, anti_patterns, quick_start, examples, content, instructions, category, tags FROM skills WHERE project_id = $1 ORDER BY name",
    [projectId],
    { silent: true }
  );

  if (!output) return [];

  const results: SkillScanResult[] = [];

  for (const line of output.split("\n").filter(Boolean)) {
    const parts = line.split("|");
    if (parts.length < 11) continue;

    const parseArray = (raw: string): string[] | null => {
      if (!raw || raw.trim() === "") return null;
      const cleaned = raw.replace(/[{}"]/g, "");
      if (!cleaned) return null;
      return cleaned.split(",").map(s => s.trim()).filter(Boolean);
    };

    const parseJson = (raw: string): Record<string, unknown> | null => {
      if (!raw || raw.trim() === "") return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const skill: SkillRecord = {
      id: parts[0],
      name: parts[1],
      description: parts[2] || null,
      trigger_phrases: parseArray(parts[3]),
      anti_patterns: parseArray(parts[4]),
      quick_start: parts[5] || null,
      examples: parseArray(parts[6]),
      content: parseJson(parts[7]),
      instructions: parts[8] || null,
      category: parts[9] || null,
      tags: parseArray(parts[10]),
    };

    const score = scoreSkillCompleteness(skill);
    const gaps = identifyGaps(skill);

    results.push({ skill, score, gaps });
  }

  return results;
}

export async function autoImproveTriggerPhrases(skillId: string): Promise<boolean> {
  const output = await querySafeText(
    "SELECT name, description, trigger_phrases, tags FROM skills WHERE id = $1",
    [skillId],
    { silent: true }
  );

  if (!output) return false;

  const parts = output.split("|");
  const skill: Partial<SkillRecord> = {
    name: parts[0],
    description: parts[1] || null,
    trigger_phrases: parts[2] ? parts[2].replace(/[{}"]/g, "").split(",").filter(Boolean) : null,
    tags: parts[3] ? parts[3].replace(/[{}"]/g, "").split(",").filter(Boolean) : null,
  };

  const phrases = generateTriggerPhrases(skill as SkillRecord);
  if (phrases.length === 0) return false;

  const phrasesSql = `{${phrases.map(p => `"${p}"`).join(",")}}`;
  return execSafe(
    "UPDATE skills SET trigger_phrases = $1 WHERE id = $2",
    [phrasesSql, skillId],
    { silent: true }
  );
}

export async function autoImproveDescription(skillId: string, description: string): Promise<boolean> {
  return execSafe(
    "UPDATE skills SET description = $1 WHERE id = $2",
    [description, skillId],
    { silent: true }
  );
}

export interface SkillImprovementResult {
  description: string | null;
  instructions: string | null;
  quick_start: string | null;
  examples: string[] | null;
}

const AI_FIXABLE_FIELDS = new Set(["description", "instructions", "quick_start", "examples"]);

export function buildSkillImprovementPrompt(skill: SkillRecord, gaps: SkillGap[]): string {
  const aiGaps = gaps.filter(g => AI_FIXABLE_FIELDS.has(g.field));
  if (aiGaps.length === 0) return "";

  const gapList = aiGaps.map(g => `- ${g.field}: ${g.message}`).join("\n");

  const existingInfo: string[] = [];
  if (skill.name) existingInfo.push(`Name: ${skill.name}`);
  if (skill.description) existingInfo.push(`Description: ${skill.description}`);
  if (skill.category) existingInfo.push(`Category: ${skill.category}`);
  if (skill.tags && skill.tags.length > 0) existingInfo.push(`Tags: ${skill.tags.join(", ")}`);
  if (skill.trigger_phrases && skill.trigger_phrases.length > 0) existingInfo.push(`Triggers: ${skill.trigger_phrases.join(", ")}`);

  const fieldInstructions: string[] = [];
  for (const gap of aiGaps) {
    switch (gap.field) {
      case "description":
        fieldInstructions.push("[DESCRIPTION]: Write a concise 1-2 sentence description of what this skill does");
        break;
      case "instructions":
        fieldInstructions.push("[INSTRUCTIONS]: Write step-by-step instructions for using this skill");
        break;
      case "quick_start":
        fieldInstructions.push("[QUICK_START]: Write a one-line quick start command or action");
        break;
      case "examples":
        fieldInstructions.push("[EXAMPLES]: Provide 2-3 usage examples separated by semicolons");
        break;
    }
  }

  return `You are a skill documentation assistant. Generate the missing fields for this skill.

Existing skill info:
${existingInfo.join("\n")}

Missing fields to generate:
${gapList}

For each missing field, provide content using these markers:
${fieldInstructions.join("\n")}

Rules:
- Be concise and specific
- Use the skill name and existing info as context
- Each marker must be on its own line
- Do not add any other text outside the markers`;
}

export function parseSkillImprovementResponse(response: string): SkillImprovementResult {
  const result: SkillImprovementResult = {
    description: null,
    instructions: null,
    quick_start: null,
    examples: null,
  };

  if (!response || !response.trim()) return result;

  const descMatch = response.match(/\[DESCRIPTION\]:?\s*(.+?)(?=\s*\[|$)/s);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }

  const instrMatch = response.match(/\[INSTRUCTIONS\]:?\s*(.+?)(?=\s*\[|$)/s);
  if (instrMatch) {
    result.instructions = instrMatch[1].trim();
  }

  const qsMatch = response.match(/\[QUICK_START\]:?\s*(.+?)(?=\s*\[|$)/s);
  if (qsMatch) {
    result.quick_start = qsMatch[1].trim();
  }

  const exMatch = response.match(/\[EXAMPLES\]:?\s*(.+?)(?=\s*\[|$)/s);
  if (exMatch) {
    const examplesRaw = exMatch[1].trim();
    result.examples = examplesRaw
      .split(";")
      .map(e => e.trim())
      .filter(Boolean);
  }

  return result;
}

export async function applySkillImprovement(skillId: string, improvement: SkillImprovementResult): Promise<boolean> {
  let anyApplied = false;

  if (improvement.description) {
    const ok = await autoImproveDescription(skillId, improvement.description);
    if (ok) anyApplied = true;
  }

  if (improvement.instructions) {
    const ok = await execSafe(
      "UPDATE skills SET instructions = $1 WHERE id = $2",
      [improvement.instructions, skillId],
      { silent: true }
    );
    if (ok) anyApplied = true;
  }

  if (improvement.quick_start) {
    const ok = await execSafe(
      "UPDATE skills SET quick_start = $1 WHERE id = $2",
      [improvement.quick_start, skillId],
      { silent: true }
    );
    if (ok) anyApplied = true;
  }

  if (improvement.examples && improvement.examples.length > 0) {
    const examplesSql = `{${improvement.examples.map(e => `"${e.replace(/"/g, '\\"')}"`).join(",")}}`;
    const ok = await execSafe(
      "UPDATE skills SET examples = $1 WHERE id = $2",
      [examplesSql, skillId],
      { silent: true }
    );
    if (ok) anyApplied = true;
  }

  return anyApplied;
}

export interface BatchImproveOptions {
  threshold?: number;
  limit?: number;
  dryRun?: boolean;
}

export function filterSkillsForBatch(
  skills: SkillScanResult[],
  options: BatchImproveOptions = {}
): SkillScanResult[] {
  const threshold = options.threshold ?? 50;
  const limit = options.limit ?? 10;

  const aiFixableFields = new Set(["description", "instructions", "quick_start", "examples"]);

  const filtered = skills
    .filter(s => s.score < threshold)
    .filter(s => s.gaps.some(g => aiFixableFields.has(g.field)))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  return filtered;
}

export interface BatchImproveResult {
  skillId: string;
  skillName: string;
  beforeScore: number;
  afterScore: number;
  fieldsGenerated: string[];
  error?: string;
}

export interface BatchImproveSummary {
  total: number;
  succeeded: number;
  failed: number;
  avgScoreBefore: number;
  avgScoreAfter: number;
  results: BatchImproveResult[];
}
