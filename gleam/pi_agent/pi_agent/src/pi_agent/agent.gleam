import gleam/option.{type Option, None, Some}
import gleam/list
import pi_agent/types.{
  type AgentMessage, type AgentState, type Model, type Tool,
  type ThinkingLevel, type LlmMessage,
  AgentState as AgentStateConstructor, User, Assistant, ToolResult,
  TextContent, UserMessage, AssistantMessage as AsstMessage,
  ToolResultMessage,
}
import pi_agent/event
import pi_agent/openrouter.{
  type ChatMessage, OpenRouterConfig, ChatCompletionRequest,
  ChatCompletionResponse, SystemMessage, UserMessage as ORUserMessage,
  AssistantMessage as ORAssistantMessage,
  default_config, create_request,
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
