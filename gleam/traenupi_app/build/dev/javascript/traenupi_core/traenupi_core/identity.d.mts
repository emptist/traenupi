import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Nezha extends _.CustomType {}
export function AgentSource$Nezha(): AgentSource$;
export function AgentSource$isNezha(value: AgentSource$): boolean;

export class Opencode extends _.CustomType {}
export function AgentSource$Opencode(): AgentSource$;
export function AgentSource$isOpencode(value: AgentSource$): boolean;

export class Trae extends _.CustomType {}
export function AgentSource$Trae(): AgentSource$;
export function AgentSource$isTrae(value: AgentSource$): boolean;

export class External extends _.CustomType {}
export function AgentSource$External(): AgentSource$;
export function AgentSource$isExternal(value: AgentSource$): boolean;

export class Mcp extends _.CustomType {}
export function AgentSource$Mcp(): AgentSource$;
export function AgentSource$isMcp(value: AgentSource$): boolean;

export class Unknown extends _.CustomType {}
export function AgentSource$Unknown(): AgentSource$;
export function AgentSource$isUnknown(value: AgentSource$): boolean;

export type AgentSource$ = Nezha | Opencode | Trae | External | Mcp | Unknown;

export class AgentContext extends _.CustomType {
  /** @deprecated */
  constructor(
    project: $option.Option$<string>,
    git_hash: $option.Option$<string>,
    machine_fingerprint: string,
    cwd: string,
    source: AgentSource$,
    branch: $option.Option$<string>,
    session_id: $option.Option$<string>,
    inner: boolean,
    model: $option.Option$<string>
  );
  /** @deprecated */
  project: $option.Option$<string>;
  /** @deprecated */
  git_hash: $option.Option$<string>;
  /** @deprecated */
  machine_fingerprint: string;
  /** @deprecated */
  cwd: string;
  /** @deprecated */
  source: AgentSource$;
  /** @deprecated */
  branch: $option.Option$<string>;
  /** @deprecated */
  session_id: $option.Option$<string>;
  /** @deprecated */
  inner: boolean;
  /** @deprecated */
  model: $option.Option$<string>;
}
export function AgentContext$AgentContext(
  project: $option.Option$<string>,
  git_hash: $option.Option$<string>,
  machine_fingerprint: string,
  cwd: string,
  source: AgentSource$,
  branch: $option.Option$<string>,
  session_id: $option.Option$<string>,
  inner: boolean,
  model: $option.Option$<string>,
): AgentContext$;
export function AgentContext$isAgentContext(value: AgentContext$): boolean;
export function AgentContext$AgentContext$0(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$project(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$1(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$git_hash(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$2(value: AgentContext$): string;
export function AgentContext$AgentContext$machine_fingerprint(value: AgentContext$): string;
export function AgentContext$AgentContext$3(
  value: AgentContext$,
): string;
export function AgentContext$AgentContext$cwd(value: AgentContext$): string;
export function AgentContext$AgentContext$4(value: AgentContext$): AgentSource$;
export function AgentContext$AgentContext$source(value: AgentContext$): AgentSource$;
export function AgentContext$AgentContext$5(
  value: AgentContext$,
): $option.Option$<string>;
export function AgentContext$AgentContext$branch(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$6(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$session_id(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$7(value: AgentContext$): boolean;
export function AgentContext$AgentContext$inner(value: AgentContext$): boolean;
export function AgentContext$AgentContext$8(value: AgentContext$): $option.Option$<
  string
>;
export function AgentContext$AgentContext$model(value: AgentContext$): $option.Option$<
  string
>;

export type AgentContext$ = AgentContext;

export class AgentIdentity extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    project: $option.Option$<string>,
    git_hash: $option.Option$<string>,
    machine_fingerprint: $option.Option$<string>,
    created_at: number,
    display_name: $option.Option$<string>,
    description: $option.Option$<string>,
    source: $option.Option$<string>
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  project: $option.Option$<string>;
  /** @deprecated */
  git_hash: $option.Option$<string>;
  /** @deprecated */
  machine_fingerprint: $option.Option$<string>;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  display_name: $option.Option$<string>;
  /** @deprecated */
  description: $option.Option$<string>;
  /** @deprecated */
  source: $option.Option$<string>;
}
export function AgentIdentity$AgentIdentity(
  id: string,
  project: $option.Option$<string>,
  git_hash: $option.Option$<string>,
  machine_fingerprint: $option.Option$<string>,
  created_at: number,
  display_name: $option.Option$<string>,
  description: $option.Option$<string>,
  source: $option.Option$<string>,
): AgentIdentity$;
export function AgentIdentity$isAgentIdentity(value: AgentIdentity$): boolean;
export function AgentIdentity$AgentIdentity$0(value: AgentIdentity$): string;
export function AgentIdentity$AgentIdentity$id(value: AgentIdentity$): string;
export function AgentIdentity$AgentIdentity$1(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$project(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$2(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$git_hash(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$3(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$machine_fingerprint(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$4(value: AgentIdentity$): number;
export function AgentIdentity$AgentIdentity$created_at(value: AgentIdentity$): number;
export function AgentIdentity$AgentIdentity$5(
  value: AgentIdentity$,
): $option.Option$<string>;
export function AgentIdentity$AgentIdentity$display_name(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$6(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$description(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$7(value: AgentIdentity$): $option.Option$<
  string
>;
export function AgentIdentity$AgentIdentity$source(value: AgentIdentity$): $option.Option$<
  string
>;

export type AgentIdentity$ = AgentIdentity;

export class IdentityStore extends _.CustomType {
  /** @deprecated */
  constructor(identities: $dict.Dict$<string, AgentIdentity$>);
  /** @deprecated */
  identities: $dict.Dict$<string, AgentIdentity$>;
}
export function IdentityStore$IdentityStore(
  identities: $dict.Dict$<string, AgentIdentity$>,
): IdentityStore$;
export function IdentityStore$isIdentityStore(value: IdentityStore$): boolean;
export function IdentityStore$IdentityStore$0(value: IdentityStore$): $dict.Dict$<
  string,
  AgentIdentity$
>;
export function IdentityStore$IdentityStore$identities(value: IdentityStore$): $dict.Dict$<
  string,
  AgentIdentity$
>;

export type IdentityStore$ = IdentityStore;

export function new_store(): IdentityStore$;

export function new_context(cwd: string, machine_fingerprint: string): AgentContext$;

export function with_project(context: AgentContext$, project: string): AgentContext$;

export function with_git_hash(context: AgentContext$, hash: string): AgentContext$;

export function with_source(context: AgentContext$, source: AgentSource$): AgentContext$;

export function with_branch(context: AgentContext$, branch: string): AgentContext$;

export function with_session(context: AgentContext$, session_id: string): AgentContext$;

export function with_inner(context: AgentContext$, model: string): AgentContext$;

export function store_identity(store: IdentityStore$, identity: AgentIdentity$): IdentityStore$;

export function get_identity(store: IdentityStore$, id: string): $option.Option$<
  AgentIdentity$
>;

export function list_identities(store: IdentityStore$): _.List<AgentIdentity$>;

export function get_identities_by_project(
  store: IdentityStore$,
  project: string
): _.List<AgentIdentity$>;

export function count_identities(store: IdentityStore$): number;

export function source_to_string(source: AgentSource$): string;

export function generate_semantic_id(context: AgentContext$): string;

export function get_identities_by_source(
  store: IdentityStore$,
  source: AgentSource$
): _.List<AgentIdentity$>;

export function source_from_string(str: string): AgentSource$;

export function identity_to_json(identity: AgentIdentity$): string;

export function parse_identity_id(id: string): $option.Option$<
  [string, string, $option.Option$<string>]
>;

export function is_session_identity(id: string): boolean;

export function is_global_identity(id: string): boolean;

export function is_inner_identity(id: string): boolean;

export function create_identity(context: AgentContext$): AgentIdentity$;
