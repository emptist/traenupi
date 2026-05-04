import gleeunit
import gleam/json
import gleam/option.{None, Some}
import pi_agent/json as json_utils
import pi_agent/types.{
  Assistant, AssistantMessage, ImageContent, KnowledgeUpdate,
  Notification, StopReasonAborted, StopReasonEnd, StopReasonError,
  StopReasonMaxTokens, StopReasonToolUse, StatusUpdate, TextContent,
  ThinkingContent, ToolCall, ToolResult, ToolResultMessage, User, UserMessage,
  Created, Updated, Deleted, Info, Warning, Error as ErrorLevel, Debug,
}

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn encode_text_content_test() {
  let content = TextContent("Hello, world!")
  let encoded = json_utils.encode_content_block(content)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"text\",\"text\":\"Hello, world!\"}"
}

pub fn encode_image_content_test() {
  let content = ImageContent("https://example.com/image.png", "image/png")
  let encoded = json_utils.encode_content_block(content)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"image\",\"url\":\"https://example.com/image.png\",\"media_type\":\"image/png\"}"
}

pub fn encode_tool_call_test() {
  let content = ToolCall("call_123", "get_weather", "{\"city\":\"Tokyo\"}")
  let encoded = json_utils.encode_content_block(content)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"tool_call\",\"id\":\"call_123\",\"name\":\"get_weather\",\"arguments\":\"{\\\"city\\\":\\\"Tokyo\\\"}\"}"
}

pub fn encode_thinking_content_test() {
  let content = ThinkingContent("Let me think...", Some("sig_123"))
  let encoded = json_utils.encode_content_block(content)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"thinking\",\"thinking\":\"Let me think...\",\"signature\":\"sig_123\"}"
}

pub fn encode_thinking_content_no_signature_test() {
  let content = ThinkingContent("Simple thought", None)
  let encoded = json_utils.encode_content_block(content)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"thinking\",\"thinking\":\"Simple thought\",\"signature\":null}"
}

pub fn encode_user_message_test() {
  let msg = UserMessage(TextContent("Hello"), 1234567890)
  let encoded = json_utils.encode_llm_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"role\":\"user\",\"content\":{\"type\":\"text\",\"text\":\"Hello\"},\"timestamp\":1234567890}"
}

pub fn encode_assistant_message_test() {
  let msg = AssistantMessage(
    [TextContent("Hi there!")],
    StopReasonEnd,
    1234567890,
  )
  let encoded = json_utils.encode_llm_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":\"Hi there!\"}],\"stop_reason\":\"end\",\"timestamp\":1234567890}"
}

pub fn encode_tool_result_message_test() {
  let msg = ToolResultMessage(
    "call_123",
    "get_weather",
    [TextContent("Temperature: 25°C")],
    False,
    1234567890,
  )
  let encoded = json_utils.encode_llm_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"role\":\"tool_result\",\"tool_call_id\":\"call_123\",\"tool_name\":\"get_weather\",\"content\":[{\"type\":\"text\",\"text\":\"Temperature: 25°C\"}],\"is_error\":false,\"timestamp\":1234567890}"
}

pub fn encode_user_agent_message_test() {
  let msg = User(UserMessage(TextContent("Hello"), 1234567890))
  let encoded = json_utils.encode_agent_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"user\",\"message\":{\"role\":\"user\",\"content\":{\"type\":\"text\",\"text\":\"Hello\"},\"timestamp\":1234567890}}"
}

pub fn encode_assistant_agent_message_test() {
  let msg = Assistant(AssistantMessage([TextContent("Hi")], StopReasonEnd, 1234567890))
  let encoded = json_utils.encode_agent_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"assistant\",\"message\":{\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":\"Hi\"}],\"stop_reason\":\"end\",\"timestamp\":1234567890}}"
}

pub fn encode_tool_result_agent_message_test() {
  let msg = ToolResult(ToolResultMessage("call_123", "tool", [TextContent("result")], False, 1234567890))
  let encoded = json_utils.encode_agent_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"tool_result\",\"message\":{\"role\":\"tool_result\",\"tool_call_id\":\"call_123\",\"tool_name\":\"tool\",\"content\":[{\"type\":\"text\",\"text\":\"result\"}],\"is_error\":false,\"timestamp\":1234567890}}"
}

pub fn encode_notification_message_test() {
  let msg = Notification("System starting", Info)
  let encoded = json_utils.encode_agent_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"notification\",\"content\":\"System starting\",\"level\":\"info\"}"
}

pub fn encode_status_update_message_test() {
  let msg = StatusUpdate("database", "connected")
  let encoded = json_utils.encode_agent_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"status_update\",\"component\":\"database\",\"status\":\"connected\"}"
}

pub fn encode_knowledge_update_message_test() {
  let msg = KnowledgeUpdate("fact_123", Created)
  let encoded = json_utils.encode_agent_message(msg)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"knowledge_update\",\"knowledge_id\":\"fact_123\",\"action\":\"created\"}"
}

pub fn encode_stop_reason_end_test() {
  let reason = StopReasonEnd
  let encoded = json_utils.encode_stop_reason(reason)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"end\""
}

pub fn encode_stop_reason_max_tokens_test() {
  let reason = StopReasonMaxTokens
  let encoded = json_utils.encode_stop_reason(reason)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"max_tokens\""
}

pub fn encode_stop_reason_tool_use_test() {
  let reason = StopReasonToolUse
  let encoded = json_utils.encode_stop_reason(reason)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"tool_use\""
}

pub fn encode_stop_reason_error_test() {
  let reason = StopReasonError("API timeout")
  let encoded = json_utils.encode_stop_reason(reason)
  let json_string = json.to_string(encoded)
  
  assert json_string == "{\"type\":\"error\",\"message\":\"API timeout\"}"
}

pub fn encode_stop_reason_aborted_test() {
  let reason = StopReasonAborted
  let encoded = json_utils.encode_stop_reason(reason)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"aborted\""
}

pub fn encode_notification_level_info_test() {
  let level = Info
  let encoded = json_utils.encode_notification_level(level)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"info\""
}

pub fn encode_notification_level_warning_test() {
  let level = Warning
  let encoded = json_utils.encode_notification_level(level)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"warning\""
}

pub fn encode_notification_level_error_test() {
  let level = ErrorLevel
  let encoded = json_utils.encode_notification_level(level)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"error\""
}

pub fn encode_notification_level_debug_test() {
  let level = Debug
  let encoded = json_utils.encode_notification_level(level)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"debug\""
}

pub fn encode_update_action_created_test() {
  let action = Created
  let encoded = json_utils.encode_update_action(action)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"created\""
}

pub fn encode_update_action_updated_test() {
  let action = Updated
  let encoded = json_utils.encode_update_action(action)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"updated\""
}

pub fn encode_update_action_deleted_test() {
  let action = Deleted
  let encoded = json_utils.encode_update_action(action)
  let json_string = json.to_string(encoded)
  
  assert json_string == "\"deleted\""
}

pub fn decode_user_agent_message_test() {
  let json_string = "{\"type\":\"user\",\"message\":{\"role\":\"user\",\"content\":{\"type\":\"text\",\"text\":\"Hello\"},\"timestamp\":1234567890}}"
  let result = json_utils.from_json_string(json_string)
  
  assert result == Ok(User(UserMessage(TextContent("Hello"), 1234567890)))
}

pub fn decode_assistant_agent_message_test() {
  let json_string = "{\"type\":\"assistant\",\"message\":{\"role\":\"assistant\",\"content\":[{\"type\":\"text\",\"text\":\"Hi\"}],\"stop_reason\":\"end\",\"timestamp\":1234567890}}"
  let result = json_utils.from_json_string(json_string)
  
  assert result == Ok(Assistant(AssistantMessage([TextContent("Hi")], StopReasonEnd, 1234567890)))
}

pub fn decode_tool_result_agent_message_test() {
  let json_string = "{\"type\":\"tool_result\",\"message\":{\"role\":\"tool_result\",\"tool_call_id\":\"call_123\",\"tool_name\":\"tool\",\"content\":[{\"type\":\"text\",\"text\":\"result\"}],\"is_error\":false,\"timestamp\":1234567890}}"
  let result = json_utils.from_json_string(json_string)
  
  assert result == Ok(ToolResult(ToolResultMessage("call_123", "tool", [TextContent("result")], False, 1234567890)))
}

pub fn decode_notification_message_test() {
  let json_string = "{\"type\":\"notification\",\"content\":\"System starting\",\"level\":\"info\"}"
  let result = json_utils.from_json_string(json_string)
  
  assert result == Ok(Notification("System starting", Info))
}

pub fn decode_status_update_message_test() {
  let json_string = "{\"type\":\"status_update\",\"component\":\"database\",\"status\":\"connected\"}"
  let result = json_utils.from_json_string(json_string)
  
  assert result == Ok(StatusUpdate("database", "connected"))
}

pub fn decode_knowledge_update_message_test() {
  let json_string = "{\"type\":\"knowledge_update\",\"knowledge_id\":\"fact_123\",\"action\":\"created\"}"
  let result = json_utils.from_json_string(json_string)
  
  assert result == Ok(KnowledgeUpdate("fact_123", Created))
}

pub fn roundtrip_user_message_test() {
  let original = User(UserMessage(TextContent("Test roundtrip"), 999999))
  let encoded = json_utils.to_json_string(original)
  let decoded = json_utils.from_json_string(encoded)
  
  assert decoded == Ok(original)
}

pub fn roundtrip_assistant_message_test() {
  let original = Assistant(AssistantMessage([TextContent("Response")], StopReasonEnd, 111111))
  let encoded = json_utils.to_json_string(original)
  let decoded = json_utils.from_json_string(encoded)
  
  assert decoded == Ok(original)
}

pub fn roundtrip_notification_test() {
  let original = Notification("Test notification", Warning)
  let encoded = json_utils.to_json_string(original)
  let decoded = json_utils.from_json_string(encoded)
  
  assert decoded == Ok(original)
}
