import gleam/option.{type Option, Some, None}
import gleam/result
import gleam/list
import gleam/string
import gleam/dict.{type Dict}
import gleam/json
import traenupi_core/storage.{type Storage}
import traenupi_core/database.{type Database}

pub type Context {
  Context(
    working_directory: String,
    project_name: String,
    git_branch: Option(String),
    git_status: Option(String),
    recent_files: List(String),
    conversation_history: List(ConversationMessage),
    environment: Dict(String, String),
    user_preferences: Dict(String, String),
    last_updated: Int,
  )
}

pub type ConversationMessage {
  UserMessage(String)
  AssistantMessage(String)
  SystemMessage(String)
}

pub type ContextError {
  LoadError(String)
  SaveError(String)
  UpdateError(String)
  StorageError(String)
  DatabaseError(String)
}

pub type ContextUpdate {
  SetWorkingDirectory(String)
  SetProjectName(String)
  SetGitBranch(String)
  SetGitStatus(String)
  AddRecentFile(String)
  AddConversationMessage(ConversationMessage)
  SetEnvironment(String, String)
  SetUserPreference(String, String)
  ClearConversationHistory
  ClearRecentFiles
}

pub type ContextManager {
  ContextManager(
    context: Context,
    storage: Option(Storage),
    database: Option(Database),
  )
}

pub fn default_context() -> Context {
  Context(
    working_directory: ".",
    project_name: "unknown",
    git_branch: None,
    git_status: None,
    recent_files: [],
    conversation_history: [],
    environment: dict.new(),
    user_preferences: dict.new(),
    last_updated: 0,
  )
}

pub fn initialize(
  storage: Option(Storage),
  database: Option(Database),
) -> Result(ContextManager, ContextError) {
  let context = default_context()
  
  let context = case storage {
    Some(s) -> {
      case load_from_storage(s) {
        Ok(loaded) -> loaded
        Error(_) -> context
      }
    }
    None -> context
  }
  
  let context = case database {
    Some(db) -> {
      case load_from_database(db) {
        Ok(loaded) -> merge_contexts(context, loaded)
        Error(_) -> context
      }
    }
    None -> context
  }
  
  Ok(ContextManager(
    context: context,
    storage: storage,
    database: database,
  ))
}

pub fn get_context(manager: ContextManager) -> Context {
  manager.context
}

pub fn update_context(
  manager: ContextManager,
  update: ContextUpdate,
) -> Result(ContextManager, ContextError) {
  let new_context = apply_update(manager.context, update)
  
  let manager = ContextManager(..manager, context: new_context)
  
  case manager.storage {
    Some(s) -> {
      save_to_storage(s, new_context)
      |> result.map_error(fn(err) { SaveError(err) })
    }
    None -> Ok(Nil)
  }
  
  case manager.database {
    Some(db) -> {
      save_to_database(db, new_context)
      |> result.map_error(fn(err) { SaveError(err) })
    }
    None -> Ok(Nil)
  }
  
  Ok(manager)
}

pub fn save_context(manager: ContextManager) -> Result(Nil, ContextError) {
  case manager.storage {
    Some(s) -> {
      save_to_storage(s, manager.context)
      |> result.map_error(fn(err) { SaveError(err) })
    }
    None -> Ok(Nil)
  }
  
  case manager.database {
    Some(db) -> {
      save_to_database(db, manager.context)
      |> result.map_error(fn(err) { SaveError(err) })
    }
    None -> Ok(Nil)
  }
  
  Ok(Nil)
}

pub fn load_context(manager: ContextManager) -> Result(Context, ContextError) {
  let context = case manager.storage {
    Some(s) -> {
      case load_from_storage(s) {
        Ok(loaded) -> loaded
        Error(_) -> manager.context
      }
    }
    None -> manager.context
  }
  
  let context = case manager.database {
    Some(db) -> {
      case load_from_database(db) {
        Ok(loaded) -> merge_contexts(context, loaded)
        Error(_) -> context
      }
    }
    None -> context
  }
  
  Ok(context)
}

pub fn clear_history(manager: ContextManager) -> Result(ContextManager, ContextError) {
  update_context(manager, ClearConversationHistory)
}

pub fn clear_recent_files(manager: ContextManager) -> Result(ContextManager, ContextError) {
  update_context(manager, ClearRecentFiles)
}

pub fn add_message(
  manager: ContextManager,
  message: ConversationMessage,
) -> Result(ContextManager, ContextError) {
  update_context(manager, AddConversationMessage(message))
}

pub fn add_recent_file(
  manager: ContextManager,
  file: String,
) -> Result(ContextManager, ContextError) {
  update_context(manager, AddRecentFile(file))
}

pub fn set_environment(
  manager: ContextManager,
  key: String,
  value: String,
) -> Result(ContextManager, ContextError) {
  update_context(manager, SetEnvironment(key, value))
}

pub fn set_preference(
  manager: ContextManager,
  key: String,
  value: String,
) -> Result(ContextManager, ContextError) {
  update_context(manager, SetUserPreference(key, value))
}

pub fn get_environment(
  manager: ContextManager,
  key: String,
) -> Option(String) {
  dict.get(manager.context.environment, key)
}

pub fn get_preference(
  manager: ContextManager,
  key: String,
) -> Option(String) {
  dict.get(manager.context.user_preferences, key)
}

pub fn get_recent_files(manager: ContextManager, limit: Int) -> List(String) {
  manager.context.recent_files
  |> list.take(limit)
}

pub fn get_conversation_history(
  manager: ContextManager,
  limit: Int,
) -> List(ConversationMessage) {
  manager.context.conversation_history
  |> list.take(limit)
}

pub fn to_json(context: Context) -> String {
  let git_branch_json = case context.git_branch {
    Some(branch) -> json.string(branch)
    None -> json.null()
  }
  
  let git_status_json = case context.git_status {
    Some(status) -> json.string(status)
    None -> json.null()
  }
  
  json.object([
    #("working_directory", json.string(context.working_directory)),
    #("project_name", json.string(context.project_name)),
    #("git_branch", git_branch_json),
    #("git_status", git_status_json),
    #("recent_files", json.array(context.recent_files, json.string)),
    #("conversation_history", json.array(
      context.conversation_history,
      message_to_json
    )),
    #("environment", dict_to_json(context.environment)),
    #("user_preferences", dict_to_json(context.user_preferences)),
    #("last_updated", json.int(context.last_updated)),
  ])
  |> json.to_string
}

pub fn from_json(json_string: String) -> Result(Context, ContextError) {
  use json_value <- result.try(
    json.decode(json_string)
    |> result.map_error(fn(_) { LoadError("Invalid JSON") })
  )
  
  parse_context_json(json_value)
}

fn apply_update(context: Context, update: ContextUpdate) -> Context {
  case update {
    SetWorkingDirectory(dir) -> {
      Context(..context, working_directory: dir, last_updated: get_current_time())
    }
    SetProjectName(name) -> {
      Context(..context, project_name: name, last_updated: get_current_time())
    }
    SetGitBranch(branch) -> {
      Context(..context, git_branch: Some(branch), last_updated: get_current_time())
    }
    SetGitStatus(status) -> {
      Context(..context, git_status: Some(status), last_updated: get_current_time())
    }
    AddRecentFile(file) -> {
      let recent = [file, ..context.recent_files]
        |> list.unique()
        |> list.take(20)
      Context(..context, recent_files: recent, last_updated: get_current_time())
    }
    AddConversationMessage(message) -> {
      let history = [message, ..context.conversation_history]
        |> list.take(100)
      Context(..context, conversation_history: history, last_updated: get_current_time())
    }
    SetEnvironment(key, value) -> {
      let env = dict.insert(context.environment, key, value)
      Context(..context, environment: env, last_updated: get_current_time())
    }
    SetUserPreference(key, value) -> {
      let prefs = dict.insert(context.user_preferences, key, value)
      Context(..context, user_preferences: prefs, last_updated: get_current_time())
    }
    ClearConversationHistory -> {
      Context(..context, conversation_history: [], last_updated: get_current_time())
    }
    ClearRecentFiles -> {
      Context(..context, recent_files: [], last_updated: get_current_time())
    }
  }
}

fn merge_contexts(base: Context, override: Context) -> Context {
  Context(
    working_directory: override.working_directory,
    project_name: override.project_name,
    git_branch: override.git_branch,
    git_status: override.git_status,
    recent_files: list.append(override.recent_files, base.recent_files)
      |> list.unique()
      |> list.take(20),
    conversation_history: list.append(
      override.conversation_history,
      base.conversation_history
    )
      |> list.take(100),
    environment: dict.merge(base.environment, override.environment),
    user_preferences: dict.merge(base.user_preferences, override.user_preferences),
    last_updated: override.last_updated,
  )
}

fn save_to_storage(storage: Storage, context: Context) -> Result(Nil, String) {
  let json_data = to_json(context)
  storage.save_json(storage, "context.json", json_data)
}

fn load_from_storage(storage: Storage) -> Result(Context, String) {
  use json_data <- result.try(storage.load_json(storage, "context.json"))
  from_json(json_data)
}

fn save_to_database(db: Database, context: Context) -> Result(Nil, String) {
  let json_data = to_json(context)
  db.set(db, "context:current", json_data)
}

fn load_from_database(db: Database) -> Result(Context, String) {
  use json_data <- result.try(db.get(db, "context:current"))
  from_json(json_data)
}

fn message_to_json(message: ConversationMessage) -> json.Json {
  case message {
    UserMessage(content) -> {
      json.object([
        #("type", json.string("user")),
        #("content", json.string(content)),
      ])
    }
    AssistantMessage(content) -> {
      json.object([
        #("type", json.string("assistant")),
        #("content", json.string(content)),
      ])
    }
    SystemMessage(content) -> {
      json.object([
        #("type", json.string("system")),
        #("content", json.string(content)),
      ])
    }
  }
}

fn dict_to_json(d: Dict(String, String)) -> json.Json {
  let pairs = dict.to_list(d)
    |> list.map(fn(pair) {
      let #(key, value) = pair
      #(key, json.string(value))
    })
  json.object(pairs)
}

fn parse_context_json(json_value: json.Json) -> Result(Context, ContextError) {
  Error(LoadError("JSON parsing not yet implemented"))
}

@external(javascript, "../traenupi_core_ffi.mjs", "getCurrentTime")
fn get_current_time() -> Int
