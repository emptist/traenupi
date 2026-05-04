import gleam/javascript/promise.{type Promise}
import pi_agent/agent.{type Agent}
import pi_agent/types.{type AgentMessage, User, UserMessage, TextContent}

pub type PiAgentSession {
  PiAgentSession(agent: Agent, api_key: String)
}

@external(javascript, "./pi_agent_ffi.mjs", "createSession")
pub fn create_session(api_key: String, system_prompt: String) -> PiAgentSession

@external(javascript, "./pi_agent_ffi.mjs", "sendMessage")
pub fn send_message(
  session: PiAgentSession,
  message: String,
) -> Promise(String)

@external(javascript, "./pi_agent_ffi.mjs", "sendMessageStreaming")
pub fn send_message_streaming(
  session: PiAgentSession,
  message: String,
  on_chunk: fn(String) -> Nil,
) -> Promise(String)

pub fn new_session(api_key: String, system_prompt: String) -> PiAgentSession {
  create_session(api_key, system_prompt)
}

pub fn ask(session: PiAgentSession, question: String) -> Promise(String) {
  send_message(session, question)
}

pub fn ask_streaming(
  session: PiAgentSession,
  question: String,
  on_chunk: fn(String) -> Nil,
) -> Promise(String) {
  send_message_streaming(session, question, on_chunk)
}
