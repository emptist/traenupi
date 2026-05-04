import gleam/list
import gleam/option.{type Option, None, Some}
import pi_agent/types.{
  type ContentBlock, type ToolExecutionResult, ToolExecutionResult as ToolResult,
  TextContent, ToolCall,
}

pub type ToolHandler =
  fn(String) -> ToolExecutionResult

pub type ToolRegistry {
  ToolRegistry(tools: List(#(String, ToolHandler)))
}

pub fn new_registry() -> ToolRegistry {
  ToolRegistry(tools: [])
}

pub fn register_tool(
  registry: ToolRegistry,
  name: String,
  handler: ToolHandler,
) -> ToolRegistry {
  ToolRegistry(tools: [#(name, handler), ..registry.tools])
}

pub fn execute_tool(
  registry: ToolRegistry,
  tool_call: ContentBlock,
) -> ToolExecutionResult {
  case tool_call {
    ToolCall(id, name, arguments) -> {
      case find_handler(registry, name) {
        Some(handler) -> {
          handler(arguments)
        }
        None -> {
          ToolResult(
            content: [TextContent("Tool not found: " <> name)],
            is_error: True,
            details: None,
          )
        }
      }
    }
    _ -> {
      ToolResult(
        content: [TextContent("Invalid tool call")],
        is_error: True,
        details: None,
      )
    }
  }
}

fn find_handler(
  registry: ToolRegistry,
  name: String,
) -> Option(ToolHandler) {
  case registry.tools {
    [] -> None
    [#(tool_name, handler), ..rest] -> {
      case tool_name == name {
        True -> Some(handler)
        False -> find_handler(ToolRegistry(tools: rest), name)
      }
    }
  }
}

pub fn extract_tool_calls(content_blocks: List(ContentBlock)) -> List(ContentBlock) {
  content_blocks
  |> list.filter(fn(block) {
    case block {
      ToolCall(_, _, _) -> True
      _ -> False
    }
  })
}

pub fn has_tool_calls(content_blocks: List(ContentBlock)) -> Bool {
  case extract_tool_calls(content_blocks) {
    [] -> False
    _ -> True
  }
}
