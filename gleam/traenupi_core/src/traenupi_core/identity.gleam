import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/string
import gleam/int

pub type AgentSource {
  Nezha
  Opencode
  Trae
  External
  Mcp
  Unknown
}

pub type AgentContext {
  AgentContext(
    project: Option(String),
    git_hash: Option(String),
    machine_fingerprint: String,
    cwd: String,
    source: AgentSource,
    branch: Option(String),
    session_id: Option(String),
    inner: Bool,
    model: Option(String),
  )
}

pub type AgentIdentity {
  AgentIdentity(
    id: String,
    project: Option(String),
    git_hash: Option(String),
    machine_fingerprint: Option(String),
    created_at: Int,
    display_name: Option(String),
    description: Option(String),
    source: Option(String),
  )
}

pub type IdentityStore {
  IdentityStore(identities: Dict(String, AgentIdentity))
}

pub fn new_store() -> IdentityStore {
  IdentityStore(identities: dict.new())
}

pub fn new_context(cwd: String, machine_fingerprint: String) -> AgentContext {
  AgentContext(
    project: None,
    git_hash: None,
    machine_fingerprint: machine_fingerprint,
    cwd: cwd,
    source: Unknown,
    branch: None,
    session_id: None,
    inner: False,
    model: None,
  )
}

pub fn with_project(context: AgentContext, project: String) -> AgentContext {
  AgentContext(..context, project: Some(project))
}

pub fn with_git_hash(context: AgentContext, hash: String) -> AgentContext {
  AgentContext(..context, git_hash: Some(hash))
}

pub fn with_source(context: AgentContext, source: AgentSource) -> AgentContext {
  AgentContext(..context, source: source)
}

pub fn with_branch(context: AgentContext, branch: String) -> AgentContext {
  AgentContext(..context, branch: Some(branch))
}

pub fn with_session(context: AgentContext, session_id: String) -> AgentContext {
  AgentContext(..context, session_id: Some(session_id))
}

pub fn with_inner(context: AgentContext, model: String) -> AgentContext {
  AgentContext(..context, inner: True, model: Some(model))
}

pub fn generate_semantic_id(context: AgentContext) -> String {
  let source = source_to_string(context.source)
  
  case context.inner, context.project, context.session_id {
    True, Some(project), Some(session_id) -> {
      case context.model {
        Some(model) -> "I-" <> model <> "-" <> project <> "-" <> session_id
        None -> "I-" <> source <> "-" <> project <> "-" <> session_id
      }
    }
    True, Some(project), None -> {
      case context.model {
        Some(model) -> "I-" <> model <> "-" <> project
        None -> "I-" <> source <> "-" <> project
      }
    }
    True, None, Some(session_id) -> {
      case context.model {
        Some(model) -> "I-" <> model <> "-" <> session_id
        None -> "I-" <> source <> "-" <> session_id
      }
    }
    True, None, None -> {
      case context.model {
        Some(model) -> "I-" <> model
        None -> "I-" <> source
      }
    }
    False, Some(project), Some(session_id) -> {
      "S-" <> source <> "-" <> project <> "-" <> session_id
    }
    False, Some(project), None -> {
      "S-" <> source <> "-" <> project
    }
    False, None, _ -> {
      let cwd_name = context.cwd
        |> string.split("/")
        |> list.reverse()
        |> list.first()
        |> option.from_result()
        |> option.unwrap(or: "unknown")
      "G-" <> source <> "-" <> cwd_name <> "-" <> context.machine_fingerprint
    }
  }
}

pub fn create_identity(context: AgentContext) -> AgentIdentity {
  AgentIdentity(
    id: generate_semantic_id(context),
    project: context.project,
    git_hash: context.git_hash,
    machine_fingerprint: Some(context.machine_fingerprint),
    created_at: now(),
    display_name: None,
    description: None,
    source: Some(source_to_string(context.source)),
  )
}

pub fn store_identity(store: IdentityStore, identity: AgentIdentity) -> IdentityStore {
  IdentityStore(identities: dict.insert(store.identities, identity.id, identity))
}

pub fn get_identity(store: IdentityStore, id: String) -> Option(AgentIdentity) {
  case dict.get(store.identities, id) {
    Ok(identity) -> Some(identity)
    Error(Nil) -> None
  }
}

pub fn list_identities(store: IdentityStore) -> List(AgentIdentity) {
  dict.values(store.identities)
}

pub fn get_identities_by_project(store: IdentityStore, project: String) -> List(AgentIdentity) {
  store.identities
  |> dict.values()
  |> list.filter(fn(identity) {
    case identity.project {
      Some(p) -> p == project
      None -> False
    }
  })
}

pub fn get_identities_by_source(store: IdentityStore, source: AgentSource) -> List(AgentIdentity) {
  let source_str = source_to_string(source)
  store.identities
  |> dict.values()
  |> list.filter(fn(identity) {
    case identity.source {
      Some(s) -> s == source_str
      None -> False
    }
  })
}

pub fn count_identities(store: IdentityStore) -> Int {
  dict.size(store.identities)
}

pub fn source_to_string(source: AgentSource) -> String {
  case source {
    Nezha -> "nezha"
    Opencode -> "opencode"
    Trae -> "trae"
    External -> "external"
    Mcp -> "mcp"
    Unknown -> "unknown"
  }
}

pub fn source_from_string(str: String) -> AgentSource {
  case str {
    "nezha" -> Nezha
    "opencode" -> Opencode
    "trae" -> Trae
    "external" -> External
    "mcp" -> Mcp
    _ -> Unknown
  }
}

pub fn identity_to_json(identity: AgentIdentity) -> String {
  let project_json = case identity.project {
    Some(p) -> "\"" <> p <> "\""
    None -> "null"
  }
  
  let source_json = case identity.source {
    Some(s) -> "\"" <> s <> "\""
    None -> "null"
  }
  
  "{\"id\":\"" <> identity.id <> "\",\"project\":" <> project_json <> ",\"source\":" <> source_json <> ",\"created_at\":" <> int.to_string(identity.created_at) <> "}"
}

pub fn parse_identity_id(id: String) -> Option(#(String, String, Option(String))) {
  let parts = string.split(id, "-")
  
  case list.first(parts) {
    Ok("S") -> {
      case get_at(parts, 1), get_at(parts, 2) {
        Some(source), Some(project) -> {
          let session = case get_at(parts, 3) {
            Some(s) -> Some(s)
            None -> None
          }
          Some(#(source, project, session))
        }
        _, _ -> None
      }
    }
    Ok("G") -> {
      case get_at(parts, 1), get_at(parts, 2) {
        Some(source), Some(cwd_name) -> Some(#(source, cwd_name, None))
        _, _ -> None
      }
    }
    Ok("I") -> {
      case get_at(parts, 1), get_at(parts, 2) {
        Some(model_or_source), Some(project_or_session) -> {
          let session = case get_at(parts, 3) {
            Some(s) -> Some(s)
            None -> None
          }
          Some(#(model_or_source, project_or_session, session))
        }
        Some(model_or_source), None -> Some(#(model_or_source, "", None))
        _, _ -> None
      }
    }
    _ -> None
  }
}

fn get_at(list: List(String), index: Int) -> Option(String) {
  list
  |> list.drop(index)
  |> list.first()
  |> option.from_result()
}

pub fn is_session_identity(id: String) -> Bool {
  case string.split(id, "-") |> list.first() {
    Ok("S") -> True
    _ -> False
  }
}

pub fn is_global_identity(id: String) -> Bool {
  case string.split(id, "-") |> list.first() {
    Ok("G") -> True
    _ -> False
  }
}

pub fn is_inner_identity(id: String) -> Bool {
  case string.split(id, "-") |> list.first() {
    Ok("I") -> True
    _ -> False
  }
}

@external(javascript, "./identity_ffi.mjs", "now")
fn now() -> Int
