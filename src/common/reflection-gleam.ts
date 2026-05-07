import {
  new_reflection,
  with_task,
  with_learning,
  with_issue,
  with_suggestion,
  with_praise,
  with_scores,
  with_type,
  with_sentiment,
  new_reflection_store,
  store_reflection,
  get_reflection,
  get_all_reflections,
  get_reflections_by_agent,
  get_reflections_by_type,
  count_reflections,
  reflection_type_to_string,
  reflection_type_from_string,
  sentiment_to_string,
  sentiment_from_string,
  severity_to_string,
  severity_from_string,
  type Reflection$,
  type ReflectionStore$,
  type ReflectionType$,
  type Sentiment$,
  type Severity$,
  listToArray,
  optionToNullable,
} from "./gleam-bridge.js";
import { querySafeText, execSafe } from "./db-safe.js";
import { loadJsonFile, saveJsonFile, getStoragePath } from "./storage.js";

export interface Reflection {
  id: string;
  taskId?: string;
  summary: string;
  learnings: Array<{ topic: string; reminder: string }>;
  issues: Array<{ severity: string; location: string; description: string }>;
  suggestions: Array<{ priority: number; area: string; description: string }>;
  praise: Array<{ area: string; description: string }>;
  overallScore?: number;
  codeQualityScore?: number;
  testCoverageScore?: number;
  documentationScore?: number;
  agentId: string;
  sessionId?: string;
  taskTitle?: string;
  taskResult?: string;
  reflectionType: string;
  sentiment?: string;
  createdAt: number;
  updatedAt: number;
}

let reflectionStore: ReflectionStore$ = new_reflection_store();

export async function createReflection(
  summary: string,
  agentId: string,
  options?: {
    taskId?: string;
    taskTitle?: string;
    type?: string;
  }
): Promise<Reflection> {
  let reflection = new_reflection(summary, agentId);
  
  if (options?.taskId && options?.taskTitle) {
    reflection = with_task(reflection, options.taskId, options.taskTitle);
  }
  
  if (options?.type) {
    const reflectionType = reflection_type_from_string(options.type);
    reflection = with_type(reflection, reflectionType);
  }
  
  const now = Date.now();
  const result: Reflection = {
    id: reflection.id,
    summary: reflection.summary,
    learnings: [],
    issues: [],
    suggestions: [],
    praise: [],
    agentId: reflection.agent_id,
    reflectionType: reflection_type_to_string(reflection.reflection_type),
    createdAt: now,
    updatedAt: now,
  };
  
  if (options?.taskId) result.taskId = options.taskId;
  if (options?.taskTitle) result.taskTitle = options.taskTitle;
  
  reflectionStore = store_reflection(reflectionStore, reflection);
  await saveReflectionToDb(result);
  
  return result;
}

export function addLearning(reflection: Reflection, topic: string, reminder: string): Reflection {
  const gleamReflection = reflectionToGleam(reflection);
  const updated = with_learning(gleamReflection, topic, reminder);
  reflectionStore = store_reflection(reflectionStore, updated);
  
  return {
    ...reflection,
    learnings: [...reflection.learnings, { topic, reminder }],
    updatedAt: Date.now(),
  };
}

export function addIssue(
  reflection: Reflection,
  severity: "critical" | "high" | "medium" | "low",
  location: string,
  description: string
): Reflection {
  const gleamReflection = reflectionToGleam(reflection);
  const severityType = severity_from_string(severity);
  const updated = with_issue(gleamReflection, severityType, location, description);
  reflectionStore = store_reflection(reflectionStore, updated);
  
  return {
    ...reflection,
    issues: [...reflection.issues, { severity, location, description }],
    updatedAt: Date.now(),
  };
}

export function addSuggestion(
  reflection: Reflection,
  priority: number,
  area: string,
  description: string
): Reflection {
  const gleamReflection = reflectionToGleam(reflection);
  const updated = with_suggestion(gleamReflection, priority, area, description);
  reflectionStore = store_reflection(reflectionStore, updated);
  
  return {
    ...reflection,
    suggestions: [...reflection.suggestions, { priority, area, description }],
    updatedAt: Date.now(),
  };
}

export function addPraise(reflection: Reflection, area: string, description: string): Reflection {
  const gleamReflection = reflectionToGleam(reflection);
  const updated = with_praise(gleamReflection, area, description);
  reflectionStore = store_reflection(reflectionStore, updated);
  
  return {
    ...reflection,
    praise: [...reflection.praise, { area, description }],
    updatedAt: Date.now(),
  };
}

export function setScores(
  reflection: Reflection,
  overall: number,
  codeQuality: number,
  testCoverage: number,
  documentation: number
): Reflection | null {
  const gleamReflection = reflectionToGleam(reflection);
  const result = with_scores(gleamReflection, overall, codeQuality, testCoverage, documentation);
  
  if (result.isOk()) {
    const updated = (result as unknown as { 0: Reflection$ })[0];
    reflectionStore = store_reflection(reflectionStore, updated);
    return {
      ...reflection,
      overallScore: overall,
      codeQualityScore: codeQuality,
      testCoverageScore: testCoverage,
      documentationScore: documentation,
      updatedAt: Date.now(),
    };
  }
  
  return null;
}

export function setSentiment(reflection: Reflection, sentiment: "positive" | "negative" | "neutral" | "mixed"): Reflection {
  const gleamReflection = reflectionToGleam(reflection);
  const sentimentType = sentiment_from_string(sentiment);
  const updated = with_sentiment(gleamReflection, sentimentType);
  reflectionStore = store_reflection(reflectionStore, updated);
  
  return {
    ...reflection,
    sentiment,
    updatedAt: Date.now(),
  };
}

export function getReflectionById(id: string): Reflection | null {
  const result = get_reflection(reflectionStore, id);
  
  if (result && "0" in result) {
    return gleamToReflection((result as unknown as { 0: Reflection$ })[0]);
  }
  
  return null;
}

export function getReflectionsByAgent(agentId: string): Reflection[] {
  const reflections = listToArray(get_reflections_by_agent(reflectionStore, agentId));
  return reflections.map(gleamToReflection);
}

export function getReflectionsByType(type: string): Reflection[] {
  const reflectionType = reflection_type_from_string(type);
  const reflections = listToArray(get_reflections_by_type(reflectionStore, reflectionType));
  return reflections.map(gleamToReflection);
}

export function getAllReflections(): Reflection[] {
  const reflections = listToArray(get_all_reflections(reflectionStore));
  return reflections.map(gleamToReflection);
}

export function getReflectionCount(): number {
  return count_reflections(reflectionStore);
}

export async function loadReflectionsFromDb(): Promise<void> {
  try {
    const output = await querySafeText(
      `SELECT id, task_id, summary, learnings, issues, suggestions, praise,
              overall_score, code_quality_score, test_coverage_score, documentation_score,
              agent_id, session_id, task_title, reflection_type, sentiment, created_at
       FROM reflections ORDER BY created_at DESC LIMIT 100`
    );
    
    if (!output.trim()) return;
    
    reflectionStore = new_reflection_store();
    
    const lines = output.trim().split("\n");
    for (const line of lines) {
      const parts = line.split("|");
      if (parts.length < 12) continue;
      
      const reflection = new_reflection(parts[2] || "", parts[11] || "unknown");
      reflectionStore = store_reflection(reflectionStore, reflection);
    }
  } catch {
    // Database not available, use in-memory store
  }
}

export async function saveReflectionToDb(reflection: Reflection): Promise<void> {
  try {
    const learningsJson = JSON.stringify(reflection.learnings);
    const issuesJson = JSON.stringify(reflection.issues);
    const suggestionsJson = JSON.stringify(reflection.suggestions);
    const praiseJson = JSON.stringify(reflection.praise);
    
    await execSafe(
      `INSERT INTO reflections (id, task_id, summary, learnings, issues, suggestions, praise,
         overall_score, code_quality_score, test_coverage_score, documentation_score,
         agent_id, session_id, task_title, reflection_type, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6, $7,
               $8, $9, $10, $11,
               $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
         summary = EXCLUDED.summary,
         learnings = EXCLUDED.learnings,
         issues = EXCLUDED.issues,
         suggestions = EXCLUDED.suggestions,
         praise = EXCLUDED.praise,
         overall_score = EXCLUDED.overall_score,
         updated_at = NOW()`,
      [
        reflection.id,
        reflection.taskId || null,
        reflection.summary,
        learningsJson,
        issuesJson,
        suggestionsJson,
        praiseJson,
        reflection.overallScore || null,
        reflection.codeQualityScore || null,
        reflection.testCoverageScore || null,
        reflection.documentationScore || null,
        reflection.agentId,
        reflection.sessionId || null,
        reflection.taskTitle || null,
        reflection.reflectionType,
        reflection.sentiment || null,
      ]
    );
  } catch {
    // Database not available
  }
}

function reflectionToGleam(reflection: Reflection): Reflection$ {
  let gleamReflection = new_reflection(reflection.summary, reflection.agentId);
  
  if (reflection.taskId && reflection.taskTitle) {
    gleamReflection = with_task(gleamReflection, reflection.taskId, reflection.taskTitle);
  }
  
  for (const learning of reflection.learnings) {
    gleamReflection = with_learning(gleamReflection, learning.topic, learning.reminder);
  }
  
  for (const issue of reflection.issues) {
    const severity = severity_from_string(issue.severity);
    gleamReflection = with_issue(gleamReflection, severity, issue.location, issue.description);
  }
  
  for (const suggestion of reflection.suggestions) {
    gleamReflection = with_suggestion(gleamReflection, suggestion.priority, suggestion.area, suggestion.description);
  }
  
  for (const p of reflection.praise) {
    gleamReflection = with_praise(gleamReflection, p.area, p.description);
  }
  
  if (reflection.overallScore && reflection.codeQualityScore && 
      reflection.testCoverageScore && reflection.documentationScore) {
    const result = with_scores(
      gleamReflection,
      reflection.overallScore,
      reflection.codeQualityScore,
      reflection.testCoverageScore,
      reflection.documentationScore
    );
    if (result.isOk()) {
      gleamReflection = (result as unknown as { 0: Reflection$ })[0];
    }
  }
  
  if (reflection.sentiment) {
    const sentiment = sentiment_from_string(reflection.sentiment);
    gleamReflection = with_sentiment(gleamReflection, sentiment);
  }
  
  return gleamReflection;
}

function gleamToReflection(gleam: Reflection$): Reflection {
  return {
    id: gleam.id,
    taskId: optionToNullable(gleam.task_id),
    summary: gleam.summary,
    learnings: listToArray(gleam.learnings).map(l => ({ topic: l.topic, reminder: l.reminder })),
    issues: listToArray(gleam.issues).map(i => ({
      severity: severity_to_string(i.severity),
      location: i.location,
      description: i.description,
    })),
    suggestions: listToArray(gleam.suggestions).map(s => ({
      priority: s.priority,
      area: s.area,
      description: s.description,
    })),
    praise: listToArray(gleam.praise).map(p => ({ area: p.area, description: p.description })),
    overallScore: optionToNullable(gleam.overall_score),
    codeQualityScore: optionToNullable(gleam.code_quality_score),
    testCoverageScore: optionToNullable(gleam.test_coverage_score),
    documentationScore: optionToNullable(gleam.documentation_score),
    agentId: gleam.agent_id,
    sessionId: optionToNullable(gleam.session_id),
    taskTitle: optionToNullable(gleam.task_title),
    reflectionType: reflection_type_to_string(gleam.reflection_type),
    sentiment: gleam.sentiment ? sentiment_to_string(gleam.sentiment) : undefined,
    createdAt: gleam.created_at * 1000,
    updatedAt: gleam.updated_at * 1000,
  };
}
