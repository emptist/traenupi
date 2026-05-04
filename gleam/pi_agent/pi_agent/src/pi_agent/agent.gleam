import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/javascript/promise.{type Promise}
import pi_agent/types.{
  type AgentMessage, type AgentState, type Model, type Tool,
  type ThinkingLevel, type LlmMessage, type AgentEvent,
  AgentState as AgentStateConstructor, User, Assistant, ToolResult,
  TextContent, UserMessage, AssistantMessage as AsstMessage,
  ToolResultMessage, AgentStart, AgentEnd, TurnStart, TurnEnd,
  StopReasonEnd,
}
import pi_agent/event
import pi_agent/openrouter.{
  type ChatMessage, OpenRouterConfig, ChatCompletionRequest,
  ChatCompletionResponse, SystemMessage, UserMessage as ORUserMessage,
  AssistantMessage as ORAssistantMessage, ToolMessage,
  default_config, create_request, send_chat_completion,
}
import pi_agent/tool

pub type Agent {
  Agent(state: AgentState, emitter: event.EventEmitter)
}

pub fn new(
  system_prompt: String,
  model: Model,
  thinking_level: ThinkingLevel,
) -> Agent {
  Agent(
    state: AgentStateConstructor(
      system_prompt: system_prompt,
      model: model,
      messages: [],
      tools: [],
      thinking_level: thinking_level,
      is_streaming: False,
      pending_tool_calls: [],
      error_message: None,
    ),
    emitter: event.new_emitter(),
  )
}

pub fn with_tools(agent: Agent, tools: List(Tool)) -> Agent {
  Agent(state: AgentStateConstructor(..agent.state, tools: tools), emitter: agent.emitter)
}

pub fn add_message(agent: Agent, message: AgentMessage) -> Agent {
  Agent(
    state: AgentStateConstructor(..agent.state, messages: list.append(agent.state.messages, [message])),
    emitter: agent.emitter,
  )
}

pub fn on_event(agent: Agent, handler: event.EventHandler) -> Agent {
  Agent(state: agent.state, emitter: event.on(agent.emitter, handler))
}

pub fn get_messages(agent: Agent) -> List(AgentMessage) {
  agent.state.messages
}

pub fn get_last_message(agent: Agent) -> Option(AgentMessage) {
  case list.reverse(agent.state.messages) {
    [first, ..] -> Some(first)
    [] -> None
  }
}

pub fn run(agent: Agent, api_key: String) -> Promise(Result(Agent, String)) {
  let _ = event.emit(agent.emitter, AgentStart)
  
  let config = default_config(api_key)
  let chat_messages = convert_to_chat_messages(agent.state.messages)
  let all_messages = [SystemMessage(agent.state.system_prompt), ..chat_messages]
  let request = create_request(config, all_messages)
  
  promise.map(send_chat_completion(config, request), fn(result) {
    case result {
      Ok(response) -> {
        let _ = event.emit(agent.emitter, TurnStart)
        
        case response.choices {
          [choice, ..] -> {
            let assistant_msg = case choice.message {
              ORAssistantMessage(text) -> {
                let timestamp = 0
                Assistant(AsstMessage([TextContent(text)], StopReasonEnd, timestamp))
              }
              _ -> {
                Assistant(AsstMessage([TextContent("Unsupported message type")], StopReasonEnd, 0))
              }
            }
            
            let new_messages = list.append(agent.state.messages, [assistant_msg])
            let new_state = AgentStateConstructor(..agent.state, messages: new_messages)
            let new_agent = Agent(state: new_state, emitter: agent.emitter)
            
            let _ = event.emit(agent.emitter, TurnEnd(AsstMessage([TextContent("")], StopReasonEnd, 0), []))
            let _ = event.emit(agent.emitter, AgentEnd([assistant_msg]))
            
            Ok(new_agent)
          }
          [] -> {
            let _ = event.emit(agent.emitter, AgentEnd([]))
            Error("No response from LLM")
          }
        }
      }
      Error(openrouter_error) -> {
        let _ = event.emit(agent.emitter, AgentEnd([]))
        Error("LLM request failed")
      }
    }
  })
}

pub fn run_sync(agent: Agent, api_key: String) -> Result(Agent, String) {
  panic as "Synchronous run not supported in JavaScript. Use run() instead."
}

fn convert_to_chat_messages(
  messages: List(AgentMessage),
) -> List(ChatMessage) {
  messages
  |> list.filter_map(fn(msg) {
    case msg {
      User(message) -> {
        case message {
          UserMessage(content, _) -> {
            case content {
              TextContent(text) -> Ok(ORUserMessage(text))
              _ -> Error(Nil)
            }
          }
          AsstMessage(_, _, _) -> Error(Nil)
          ToolResultMessage(_, _, _, _, _) -> Error(Nil)
        }
      }
      Assistant(message) -> {
        case message {
          AsstMessage(content_blocks, _, _) -> {
            let text_contents = list.filter_map(content_blocks, fn(block) {
              case block {
                TextContent(text) -> Ok(text)
                _ -> Error(Nil)
              }
            })
            case text_contents {
              [text] -> Ok(ORAssistantMessage(text))
              _ -> Error(Nil)
            }
          }
          UserMessage(_, _) -> Error(Nil)
          ToolResultMessage(_, _, _, _, _) -> Error(Nil)
        }
      }
      _ -> Error(Nil)
    }
  })
}
