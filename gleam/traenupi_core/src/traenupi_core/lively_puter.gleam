//// Lively-Puter Bridge - Gleam FFI Bindings
//// 
//// This module provides Gleam bindings for the Lively-Puter bridge,
//// allowing Gleam code to use Lively4 and Puter services.

import gleam/dynamic.{type Dynamic}
import gleam/json.{type Json}

/// Integration mode for the bridge
pub type IntegrationMode {
  LivelyFirst
  PuterFirst
  Hybrid
}

/// File information
pub type FileInfo {
  FileInfo(
    name: String,
    path: String,
    is_dir: Bool,
    size: Int,
    modified: String,
    created: String,
  )
}

/// Chat message
pub type ChatMessage {
  SystemMessage(content: String)
  UserMessage(content: String)
  AssistantMessage(content: String)
}

/// Chat response
pub type ChatResponse {
  ChatResponse(
    message: ChatMessage,
    usage: Option(ChatUsage),
  )
}

pub type ChatUsage {
  ChatUsage(
    prompt_tokens: Int,
    completion_tokens: Int,
    total_tokens: Int,
  )
}

/// User information
pub type User {
  User(
    id: String,
    username: String,
    email: String,
    avatar: String,
  )
}

/// Bridge configuration
pub type BridgeConfig {
  BridgeConfig(
    mode: IntegrationMode,
    enable_auth: Bool,
    enable_ai: Bool,
    enable_storage: Bool,
    enable_database: Bool,
  )
}

/// Default configuration
pub fn default_config() -> BridgeConfig {
  BridgeConfig(
    mode: Hybrid,
    enable_auth: True,
    enable_ai: True,
    enable_storage: True,
    enable_database: True,
  )
}

// === File System Operations ===

/// Write a file
@external(javascript, "./lively_puter_ffi.mjs", "writeFile")
pub fn write_file(path: String, content: String) -> Result(Nil, String)

/// Read a file
@external(javascript, "./lively_puter_ffi.mjs", "readFile")
pub fn read_file(path: String) -> Result(String, String)

/// Delete a file
@external(javascript, "./lively_puter_ffi.mjs", "deleteFile")
pub fn delete_file(path: String) -> Result(Nil, String)

/// Check if file exists
@external(javascript, "./lively_puter_ffi.mjs", "fileExists")
pub fn file_exists(path: String) -> Result(Bool, String)

/// List directory contents
@external(javascript, "./lively_puter_ffi.mjs", "listDirectory")
pub fn list_directory(path: String) -> Result(List(FileInfo), String)

// === AI Operations ===

/// Send a chat message
@external(javascript, "./lively_puter_ffi.mjs", "chat")
pub fn chat(messages: List(ChatMessage)) -> Result(ChatResponse, String)

/// Send a chat message with options
@external(javascript, "./lively_puter_ffi.mjs", "chatWithOptions")
pub fn chat_with_options(
  messages: List(ChatMessage),
  model: String,
  temperature: Float,
) -> Result(ChatResponse, String)

// === Database Operations ===

/// Set a key-value pair
@external(javascript, "./lively_puter_ffi.mjs", "dbSet")
pub fn db_set(key: String, value: Json) -> Result(Nil, String)

/// Get a value by key
@external(javascript, "./lively_puter_ffi.mjs", "dbGet")
pub fn db_get(key: String) -> Result(Json, String)

/// Delete a key
@external(javascript, "./lively_puter_ffi.mjs", "dbDelete")
pub fn db_delete(key: String) -> Result(Nil, String)

/// List keys with prefix
@external(javascript, "./lively_puter_ffi.mjs", "dbList")
pub fn db_list(prefix: String) -> Result(List(#(String, Json)), String)

// === Authentication Operations ===

/// Sign in
@external(javascript, "./lively_puter_ffi.mjs", "signIn")
pub fn sign_in() -> Result(User, String)

/// Sign out
@external(javascript, "./lively_puter_ffi.mjs", "signOut")
pub fn sign_out() -> Result(Nil, String)

/// Get current user
@external(javascript, "./lively_puter_ffi.mjs", "getUser")
pub fn get_user() -> Result(User, String)

/// Check if signed in
@external(javascript, "./lively_puter_ffi.mjs", "isSignedIn")
pub fn is_signed_in() -> Result(Bool, String)

// === Bridge Management ===

/// Initialize the bridge
@external(javascript, "./lively_puter_ffi.mjs", "initializeBridge")
pub fn initialize(config: BridgeConfig) -> Result(Nil, String)

/// Get current mode
@external(javascript, "./lively_puter_ffi.mjs", "getMode")
pub fn get_mode() -> Result(IntegrationMode, String)
