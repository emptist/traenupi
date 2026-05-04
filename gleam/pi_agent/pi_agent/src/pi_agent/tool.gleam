import gleam/json
import gleam/list
import gleam/option.{None, Some}
import pi_agent/types.{
  type JsonSchema, type Tool, type ToolExecutionMode,
  type ToolExecutionResult, Tool as ToolConstructor,
  ToolExecutionResult as ToolResultConstructor,
  ObjectSchema, StringSchema, NumberSchema,
  BooleanSchema, ArraySchema, SequentialExecution, ParallelExecution,
  TextContent,
}

pub fn define_tool(
  name: String,
  description: String,
  parameters: JsonSchema,
  execution_mode: ToolExecutionMode,
) -> Tool {
  ToolConstructor(name, description, parameters, execution_mode)
}

pub fn tool_to_json(tool: Tool) -> json.Json {
  json.object([
    #("type", json.string("function")),
    #(
      "function",
      json.object([
        #("name", json.string(tool.name)),
        #("description", json.string(tool.description)),
        #("parameters", json_schema_to_json(tool.parameters)),
      ]),
    ),
  ])
}

pub fn json_schema_to_json(schema: JsonSchema) -> json.Json {
  case schema {
    ObjectSchema(properties, required) -> {
      let props_json =
        properties
        |> list.map(fn(prop) {
          let #(name, prop_schema) = prop
          #(name, json_schema_to_json(prop_schema))
        })
      
      json.object([
        #("type", json.string("object")),
        #("properties", json.object(props_json)),
        #("required", json.array(required, json.string)),
      ])
    }
    
    StringSchema(description) -> {
      case description {
        Some(desc) ->
          json.object([
            #("type", json.string("string")),
            #("description", json.string(desc)),
          ])
        None -> json.object([#("type", json.string("string"))])
      }
    }
    
    NumberSchema(description) -> {
      case description {
        Some(desc) ->
          json.object([
            #("type", json.string("number")),
            #("description", json.string(desc)),
          ])
        None -> json.object([#("type", json.string("number"))])
      }
    }
    
    BooleanSchema(description) -> {
      case description {
        Some(desc) ->
          json.object([
            #("type", json.string("boolean")),
            #("description", json.string(desc)),
          ])
        None -> json.object([#("type", json.string("boolean"))])
      }
    }
    
    ArraySchema(items, description) -> {
      let base = [
        #("type", json.string("array")),
        #("items", json_schema_to_json(items)),
      ]
      
      case description {
        Some(desc) ->
          json.object(base |> list.append([#("description", json.string(desc))]))
        None -> json.object(base)
      }
    }
  }
}

pub fn create_text_result(text: String) -> ToolExecutionResult {
  ToolResultConstructor(content: [TextContent(text)], is_error: False, details: None)
}

pub fn create_error_result(error_message: String) -> ToolExecutionResult {
  ToolResultConstructor(
    content: [TextContent(error_message)],
    is_error: True,
    details: None,
  )
}

pub fn create_result_with_details(
  text: String,
  details: json.Json,
) -> ToolExecutionResult {
  ToolResultConstructor(
    content: [TextContent(text)],
    is_error: False,
    details: Some(details),
  )
}

pub fn is_sequential(tool: Tool) -> Bool {
  case tool.execution_mode {
    SequentialExecution -> True
    ParallelExecution -> False
  }
}

pub fn is_parallel(tool: Tool) -> Bool {
  case tool.execution_mode {
    SequentialExecution -> False
    ParallelExecution -> True
  }
}
