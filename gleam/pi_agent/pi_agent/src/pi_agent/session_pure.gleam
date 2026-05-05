import gleam/javascript/promise.{type Promise, map}
import gleam/option.{Some}
import pi_agent/agent.{type Agent, new as new_agent, add_message, run, get_last_message}
import pi_agent/types.{
  User, Assistant, UserMessage, TextContent,
  AssistantMessage, Model, ModelCost, ThinkingMedium,
}

pub type PiAgentSession {
  PiAgentSession(agent: Agent, api_key: String)
}

pub fn create_session(api_key: String, system_prompt: String) -> PiAgentSession {
  let model = Model(
    id: "tencent/hy3-preview:free",
    name: "Hunyuan 3 Preview",
    provider: "Tencent",
    api: "openrouter",
    context_window: 128000,
    max_tokens: 4096,
    cost: ModelCost(input: 0.0, output: 0.0, cache_read: 0.0, cache_write: 0.0),
  )
  let agent = new_agent(system_prompt, model, ThinkingMedium)
  PiAgentSession(agent: agent, api_key: api_key)
}

pub fn send_message(
  session: PiAgentSession,
  message: String,
) -> Promise(String) {
  let user_message = User(UserMessage(TextContent(message), 0))
  let updated_agent = add_message(session.agent, user_message)
  
  map(run(updated_agent, session.api_key), fn(result) {
    case result {
      Ok(new_agent) -> {
        case get_last_message(new_agent) {
          Some(Assistant(AssistantMessage(content: [TextContent(text), ..], ..))) -> text
          _ -> "[No text content in response]"
        }
      }
      Error(error) -> "[Error: " <> error <> "]"
    }
  })
}

pub fn send_message_streaming(
  session: PiAgentSession,
  message: String,
  on_chunk: fn(String) -> Nil,
) -> Promise(String) {
  let user_message = User(UserMessage(TextContent(message), 0))
  let updated_agent = add_message(session.agent, user_message)
  
  map(run(updated_agent, session.api_key), fn(result) {
    case result {
      Ok(new_agent) -> {
        case get_last_message(new_agent) {
          Some(Assistant(AssistantMessage(content: [TextContent(text), ..], ..))) -> {
            let _ = on_chunk(text)
            text
          }
          _ -> {
            let error_msg = "[No text content in response]"
            let _ = on_chunk(error_msg)
            error_msg
          }
        }
      }
      Error(error) -> {
        let error_msg = "[Error: " <> error <> "]"
        let _ = on_chunk(error_msg)
        error_msg
      }
    }
  })
}

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
