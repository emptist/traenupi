import gleam/dict
import gleam/option.{None}
import traenupi_core/schema_types.{
  type Schema, NullSchema, BoolSchema, NumberSchema, NumberConstraints,
  StringSchema, StringConstraints, ArraySchema, ArrayConstraints,
  ObjectSchema, ObjectConstraints,
}

pub fn null() -> Schema {
  NullSchema
}

pub fn bool() -> Schema {
  BoolSchema
}

pub fn number() -> Schema {
  NumberSchema(NumberConstraints(
    minimum: None,
    maximum: None,
    exclusive_minimum: None,
    exclusive_maximum: None,
    multiple_of: None,
  ))
}

pub fn string() -> Schema {
  StringSchema(StringConstraints(
    min_length: None,
    max_length: None,
    pattern: None,
    format: None,
  ))
}

pub fn array() -> Schema {
  ArraySchema(ArrayConstraints(
    items: None,
    min_items: None,
    max_items: None,
    unique_items: False,
  ))
}

pub fn object() -> Schema {
  ObjectSchema(ObjectConstraints(
    properties: dict.new(),
    required: [],
    additional_properties: None,
    pattern_properties: dict.new(),
    min_properties: None,
    max_properties: None,
  ))
}
