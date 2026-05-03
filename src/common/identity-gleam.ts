import {
  new_context,
  with_project,
  with_git_hash,
  with_source,
  with_branch,
  with_session,
  with_inner,
  generate_semantic_id,
  create_identity,
  new_identity_store,
  store_identity,
  get_identity,
  list_identities,
  get_identities_by_project,
  get_identities_by_source,
  count_identities,
  source_to_string,
  source_from_string,
  identity_to_json,
  parse_identity_id,
  is_session_identity,
  is_global_identity,
  is_inner_identity,
  type AgentContext$,
  type AgentIdentity$,
  type IdentityStore$,
  type AgentSource$,
  listToArray,
  optionToNullable,
  Some,
  None,
} from "./gleam-bridge.js";
import { execSync } from "node:child_process";
import { hostname, platform, arch, cpus } from "node:os";
import { createHash } from "node:crypto";

export type AgentSource = "nezha" | "opencode" | "trae" | "external" | "mcp" | "unknown";

export interface AgentContext {
  project?: string;
  gitHash?: string;
  machineFingerprint: string;
  cwd: string;
  source: AgentSource;
  branch?: string;
  sessionId?: string;
  inner?: boolean;
  model?: string;
}

export interface AgentIdentity {
  id: string;
  project?: string;
  gitHash?: string;
  machineFingerprint?: string;
  createdAt: number;
  displayName?: string;
  description?: string;
  source?: string;
}

let identityStore: IdentityStore$ = new_identity_store();

export function createAgentContext(cwd?: string): AgentContext {
  const workingDir = cwd || process.cwd();
  const fingerprint = getMachineFingerprint();
  
  return {
    machineFingerprint: fingerprint,
    cwd: workingDir,
    source: detectSource(),
  };
}

export function setProject(context: AgentContext, project: string): AgentContext {
  return { ...context, project };
}

export function setGitHash(context: AgentContext, gitHash: string): AgentContext {
  return { ...context, gitHash };
}

export function setSource(context: AgentContext, source: AgentSource): AgentContext {
  return { ...context, source };
}

export function setBranch(context: AgentContext, branch: string): AgentContext {
  return { ...context, branch };
}

export function setSession(context: AgentContext, sessionId: string): AgentContext {
  return { ...context, sessionId };
}

export function setInner(context: AgentContext, model: string): AgentContext {
  return { ...context, inner: true, model };
}

export function generateAgentId(context: AgentContext): string {
  const gleamContext = contextToGleam(context);
  return generate_semantic_id(gleamContext);
}

export function createAgentIdentity(context: AgentContext): AgentIdentity {
  const gleamContext = contextToGleam(context);
  const gleamIdentity = create_identity(gleamContext);
  
  identityStore = store_identity(identityStore, gleamIdentity);
  
  return gleamToIdentity(gleamIdentity);
}

export function getIdentityById(id: string): AgentIdentity | null {
  const result = get_identity(identityStore, id);
  
  if (result && "0" in result) {
    return gleamToIdentity((result as unknown as { 0: AgentIdentity$ })[0]);
  }
  
  return null;
}

export function getAllIdentities(): AgentIdentity[] {
  const identities = listToArray(list_identities(identityStore));
  return identities.map(gleamToIdentity);
}

export function getIdentitiesByProject(project: string): AgentIdentity[] {
  const identities = listToArray(get_identities_by_project(identityStore, project));
  return identities.map(gleamToIdentity);
}

export function getIdentitiesBySource(source: AgentSource): AgentIdentity[] {
  const identities = listToArray(get_identities_by_source(identityStore, source_from_string(source)));
  return identities.map(gleamToIdentity);
}

export function getIdentityCount(): number {
  return count_identities(identityStore);
}

export function parseAgentId(id: string): { source: string; project: string; session?: string } | null {
  const result = parse_identity_id(id);
  
  if (result && "0" in result) {
    const tuple = result as unknown as Record<string, unknown>;
    const source = tuple["0"] as string;
    const project = tuple["1"] as string;
    const sessionOpt = tuple["2"];
    
    return {
      source,
      project,
      session: sessionOpt && typeof sessionOpt === "object" && sessionOpt !== null && "0" in sessionOpt 
        ? (sessionOpt as Record<string, unknown>)["0"] as string 
        : undefined,
    };
  }
  
  return null;
}

export function isSessionAgent(id: string): boolean {
  return is_session_identity(id);
}

export function isGlobalAgent(id: string): boolean {
  return is_global_identity(id);
}

export function isInnerAgent(id: string): boolean {
  return is_inner_identity(id);
}

export function identityToJson(identity: AgentIdentity): string {
  const gleamIdentity = identityToGleam(identity);
  return identity_to_json(gleamIdentity);
}

export function detectSource(): AgentSource {
  if (process.env.AI_AGENT === "TRAE") {
    return "trae";
  }
  
  const envSource = process.env.NEZHA_AGENT_SOURCE;
  if (envSource === "opencode" || envSource === "external" || envSource === "mcp") {
    return envSource;
  }
  
  return "nezha";
}

export function getProjectName(): string | null {
  try {
    const remote = execSync("git remote get-url origin 2>/dev/null || echo ''", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    
    if (remote) {
      const match = remote.match(/\/([^/]+?)(?:\.git)?$/);
      if (match && match[1]) return match[1];
    }
  } catch {
    // Not in a git repo
  }
  
  return null;
}

export function getGitHash(): string | null {
  try {
    const hash = execSync("git rev-parse --short HEAD 2>/dev/null", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    
    return hash || null;
  } catch {
    return null;
  }
}

export function getGitBranch(): string {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    
    return branch || "main";
  } catch {
    return "main";
  }
}

export function getMachineFingerprint(): string {
  const info = [
    hostname(),
    platform(),
    arch(),
    cpus()[0]?.model || "unknown",
  ].join("|");
  
  return createHash("sha256").update(info).digest("hex").substring(0, 16);
}

export function resolveAgentIdentity(inner?: boolean, model?: string): AgentIdentity {
  const context = createAgentContext();
  
  const project = getProjectName();
  if (project) {
    context.project = project;
  }
  
  const gitHash = getGitHash();
  if (gitHash) {
    context.gitHash = gitHash;
  }
  
  context.branch = getGitBranch();
  
  if (inner && model) {
    context.inner = true;
    context.model = model;
  }
  
  const existing = getIdentityById(generateAgentId(context));
  if (existing) {
    return existing;
  }
  
  return createAgentIdentity(context);
}

function contextToGleam(context: AgentContext): AgentContext$ {
  let gleamContext = new_context(context.cwd, context.machineFingerprint);
  
  if (context.project) {
    gleamContext = with_project(gleamContext, context.project);
  }
  
  if (context.gitHash) {
    gleamContext = with_git_hash(gleamContext, context.gitHash);
  }
  
  gleamContext = with_source(gleamContext, source_from_string(context.source));
  
  if (context.branch) {
    gleamContext = with_branch(gleamContext, context.branch);
  }
  
  if (context.sessionId) {
    gleamContext = with_session(gleamContext, context.sessionId);
  }
  
  if (context.inner && context.model) {
    gleamContext = with_inner(gleamContext, context.model);
  }
  
  return gleamContext;
}

function gleamToIdentity(gleam: AgentIdentity$): AgentIdentity {
  return {
    id: gleam.id,
    project: optionToNullable(gleam.project),
    gitHash: optionToNullable(gleam.git_hash),
    machineFingerprint: optionToNullable(gleam.machine_fingerprint),
    createdAt: gleam.created_at * 1000,
    displayName: optionToNullable(gleam.display_name),
    description: optionToNullable(gleam.description),
    source: optionToNullable(gleam.source),
  };
}

function identityToGleam(identity: AgentIdentity): AgentIdentity$ {
  return {
    id: identity.id,
    project: identity.project ? new Some(identity.project) : new None(),
    git_hash: identity.gitHash ? new Some(identity.gitHash) : new None(),
    machine_fingerprint: identity.machineFingerprint ? new Some(identity.machineFingerprint) : new None(),
    created_at: Math.floor(identity.createdAt / 1000),
    updated_at: Math.floor(identity.createdAt / 1000),
    display_name: identity.displayName ? new Some(identity.displayName) : new None(),
    description: identity.description ? new Some(identity.description) : new None(),
    source: identity.source ? new Some(identity.source) : new None(),
  } as unknown as AgentIdentity$;
}
