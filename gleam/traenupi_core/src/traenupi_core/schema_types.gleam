import gleam/dict
import gleam/option.{type Option}
import traenupi_core/jsonx.{type JsonValue}

pub type SchemaError {
  TypeMismatch(path: String, expected: String, found: String)
  MissingField(path: String, field: String)
  ExtraField(path: String, field: String)
  InvalidValue(path: String, message: String)
  ArrayItemError(path: String, index: Int, error: SchemaError)
  CustomError(path: String, message: String)
}

pub type Schema {
  NullSchema
  BoolSchema
  NumberSchema(NumberConstraints)
  StringSchema(StringConstraints)
  ArraySchema(ArrayConstraints)
  ObjectSchema(ObjectConstraints)
  OneOfSchema(schemas: List(Schema))
  AllOfSchema(schemas: List(Schema))
  AnyOfSchema(schemas: List(Schema))
  NotSchema(schema: Schema)
  ConstSchema(value: JsonValue)
  EnumSchema(values: List(JsonValue))
}

pub type NumberConstraints {
  NumberConstraints(
    minimum: Option(Float),
    maximum: Option(Float),
    exclusive_minimum: Option(Float),
    exclusive_maximum: Option(Float),
    multiple_of: Option(Float),
  )
}

pub type StringConstraints {
  StringConstraints(
    min_length: Option(Int),
    max_length: Option(Int),
    pattern: Option(String),
    format: Option(StringFormat),
  )
}

pub type StringFormat {
  DateFormat
  TimeFormat
  DateTimeFormat
  EmailFormat
  UriFormat
  UuidFormat
  HostnameFormat
  Ipv4Format
  Ipv6Format
  CustomFormat(format: String)
}

pub type ArrayConstraints {
  ArrayConstraints(
    items: Option(Schema),
    min_items: Option(Int),
    max_items: Option(Int),
    unique_items: Bool,
  )
}

pub type ObjectConstraints {
  ObjectConstraints(
    properties: dict.Dict(String, Schema),
    required: List(String),
    additional_properties: Option(Schema),
    pattern_properties: dict.Dict(String, Schema),
    min_properties: Option(Int),
    max_properties: Option(Int),
  )
}
