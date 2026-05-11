import traenupi_core/schema_types.{
  type Schema, OneOfSchema, AllOfSchema, AnyOfSchema, NotSchema, ConstSchema,
  EnumSchema,
}
import traenupi_core/jsonx.{type JsonValue}

pub fn one_of(schemas: List(Schema)) -> Schema {
  OneOfSchema(schemas: schemas)
}

pub fn all_of(schemas: List(Schema)) -> Schema {
  AllOfSchema(schemas: schemas)
}

pub fn any_of(schemas: List(Schema)) -> Schema {
  AnyOfSchema(schemas: schemas)
}

pub fn not(schema: Schema) -> Schema {
  NotSchema(schema: schema)
}

pub fn const_value(value: JsonValue) -> Schema {
  ConstSchema(value: value)
}

pub fn enum_values(values: List(JsonValue)) -> Schema {
  EnumSchema(values: values)
}
