import gleeunit
import gleam/json
import gleam/option.{None, Some}
import pi_agent/tool
import pi_agent/types.{
  ObjectSchema, StringSchema, NumberSchema, BooleanSchema, ArraySchema,
  SequentialExecution, ParallelExecution,
}

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn define_simple_tool_test() {
  let params = ObjectSchema([], [])
  let tool_def = tool.define_tool(
    "get_weather",
    "Get current weather for a city",
    params,
    SequentialExecution,
  )
  
  assert tool_def.name == "get_weather"
  assert tool_def.description == "Get current weather for a city"
}

pub fn tool_to_json_test() {
  let params = ObjectSchema(
    [#("city", StringSchema(Some("City name")))],
    ["city"],
  )
  let tool_def = tool.define_tool(
    "get_weather",
    "Get weather",
    params,
    SequentialExecution,
  )
  
  let json_obj = tool.tool_to_json(tool_def)
  let json_string = json.to_string(json_obj)
  
  assert json_string == "{\"type\":\"function\",\"function\":{\"name\":\"get_weather\",\"description\":\"Get weather\",\"parameters\":{\"type\":\"object\",\"properties\":{\"city\":{\"type\":\"string\",\"description\":\"City name\"}},\"required\":[\"city\"]}}}"
}

pub fn create_text_result_test() {
  let result = tool.create_text_result("Success")
  
  assert result.is_error == False
}

pub fn create_error_result_test() {
  let result = tool.create_error_result("Something went wrong")
  
  assert result.is_error == True
}

pub fn create_result_with_details_test() {
  let details = json.object([#("key", json.string("value"))])
  let result = tool.create_result_with_details("Success", details)
  
  assert result.is_error == False
  case result.details {
    Some(d) -> {
      let details_string = json.to_string(d)
      assert details_string == "{\"key\":\"value\"}"
    }
    None -> panic as "Expected details to be present"
  }
}

pub fn is_sequential_test() {
  let params = ObjectSchema([], [])
  let tool_def = tool.define_tool("test", "Test", params, SequentialExecution)
  
  assert tool.is_sequential(tool_def) == True
  assert tool.is_parallel(tool_def) == False
}

pub fn is_parallel_test() {
  let params = ObjectSchema([], [])
  let tool_def = tool.define_tool("test", "Test", params, ParallelExecution)
  
  assert tool.is_parallel(tool_def) == True
  assert tool.is_sequential(tool_def) == False
}

pub fn json_schema_string_test() {
  let schema = StringSchema(Some("A string parameter"))
  let json_obj = tool.json_schema_to_json(schema)
  let json_string = json.to_string(json_obj)
  
  assert json_string == "{\"type\":\"string\",\"description\":\"A string parameter\"}"
}

pub fn json_schema_number_test() {
  let schema = NumberSchema(None)
  let json_obj = tool.json_schema_to_json(schema)
  let json_string = json.to_string(json_obj)
  
  assert json_string == "{\"type\":\"number\"}"
}

pub fn json_schema_boolean_test() {
  let schema = BooleanSchema(Some("A boolean flag"))
  let json_obj = tool.json_schema_to_json(schema)
  let json_string = json.to_string(json_obj)
  
  assert json_string == "{\"type\":\"boolean\",\"description\":\"A boolean flag\"}"
}

pub fn json_schema_array_test() {
  let schema = ArraySchema(StringSchema(None), Some("List of strings"))
  let json_obj = tool.json_schema_to_json(schema)
  let json_string = json.to_string(json_obj)
  
  assert json_string == "{\"type\":\"array\",\"items\":{\"type\":\"string\"},\"description\":\"List of strings\"}"
}
