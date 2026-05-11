import gleam/dict
import gleam/list
import gleam/option.{type Option, None, Some}
import traenupi_core/schema_types.{
  type Schema, NumberSchema, NumberConstraints, StringSchema, StringConstraints,
  ArraySchema, ArrayConstraints, ObjectSchema, ObjectConstraints,
}

pub fn with_minimum(schema: Schema, min: Float) -> Schema {
  case schema {
    NumberSchema(c) -> NumberSchema(NumberConstraints(
      minimum: Some(min),
      maximum: c.maximum,
      exclusive_minimum: c.exclusive_minimum,
      exclusive_maximum: c.exclusive_maximum,
      multiple_of: c.multiple_of,
    ))
    _ -> schema
  }
}

pub fn with_maximum(schema: Schema, max: Float) -> Schema {
  case schema {
    NumberSchema(c) -> NumberSchema(NumberConstraints(
      minimum: c.minimum,
      maximum: Some(max),
      exclusive_minimum: c.exclusive_minimum,
      exclusive_maximum: c.exclusive_maximum,
      multiple_of: c.multiple_of,
    ))
    _ -> schema
  }
}

pub fn with_min_length(schema: Schema, min: Int) -> Schema {
  case schema {
    StringSchema(c) -> StringSchema(StringConstraints(
      min_length: Some(min),
      max_length: c.max_length,
      pattern: c.pattern,
      format: c.format,
    ))
    _ -> schema
  }
}

pub fn with_max_length(schema: Schema, max: Int) -> Schema {
  case schema {
    StringSchema(c) -> StringSchema(StringConstraints(
      min_length: c.min_length,
      max_length: Some(max),
      pattern: c.pattern,
      format: c.format,
    ))
    _ -> schema
  }
}

pub fn with_pattern(schema: Schema, pattern: String) -> Schema {
  case schema {
    StringSchema(c) -> StringSchema(StringConstraints(
      min_length: c.min_length,
      max_length: c.max_length,
      pattern: Some(pattern),
      format: c.format,
    ))
    _ -> schema
  }
}

pub fn with_items(schema: Schema, items: Schema) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: Some(items),
      min_items: c.min_items,
      max_items: c.max_items,
      unique_items: c.unique_items,
    ))
    _ -> schema
  }
}

pub fn with_min_items(schema: Schema, min: Int) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: c.items,
      min_items: Some(min),
      max_items: c.max_items,
      unique_items: c.unique_items,
    ))
    _ -> schema
  }
}

pub fn with_max_items(schema: Schema, max: Int) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: c.items,
      min_items: c.min_items,
      max_items: Some(max),
      unique_items: c.unique_items,
    ))
    _ -> schema
  }
}

pub fn unique_items(schema: Schema) -> Schema {
  case schema {
    ArraySchema(c) -> ArraySchema(ArrayConstraints(
      items: c.items,
      min_items: c.min_items,
      max_items: c.max_items,
      unique_items: True,
    ))
    _ -> schema
  }
}

pub fn with_property(schema: Schema, name: String, property: Schema) -> Schema {
  case schema {
    ObjectSchema(c) -> {
      let properties = dict.insert(c.properties, name, property)
      ObjectSchema(ObjectConstraints(
        properties: properties,
        required: c.required,
        additional_properties: c.additional_properties,
        pattern_properties: c.pattern_properties,
        min_properties: c.min_properties,
        max_properties: c.max_properties,
      ))
    }
    _ -> schema
  }
}

pub fn with_required(schema: Schema, fields: List(String)) -> Schema {
  case schema {
    ObjectSchema(c) -> {
      let required = unique_strings(list.append(c.required, fields))
      ObjectSchema(ObjectConstraints(
        properties: c.properties,
        required: required,
        additional_properties: c.additional_properties,
        pattern_properties: c.pattern_properties,
        min_properties: c.min_properties,
        max_properties: c.max_properties,
      ))
    }
    _ -> schema
  }
}

pub fn with_additional_properties(schema: Schema, additional: Schema) -> Schema {
  case schema {
    ObjectSchema(c) -> ObjectSchema(ObjectConstraints(
      properties: c.properties,
      required: c.required,
      additional_properties: Some(additional),
      pattern_properties: c.pattern_properties,
      min_properties: c.min_properties,
      max_properties: c.max_properties,
    ))
    _ -> schema
  }
}

pub fn no_additional_properties(schema: Schema) -> Schema {
  case schema {
    ObjectSchema(c) -> ObjectSchema(ObjectConstraints(
      properties: c.properties,
      required: c.required,
      additional_properties: None,
      pattern_properties: c.pattern_properties,
      min_properties: c.min_properties,
      max_properties: c.max_properties,
    ))
    _ -> schema
  }
}

fn unique_strings(l: List(String)) -> List(String) {
  unique_strings_acc(l, [])
}

fn unique_strings_acc(l: List(String), acc: List(String)) -> List(String) {
  case l {
    [] -> list.reverse(acc)
    [first, ..rest] -> {
      case list.contains(acc, first) {
        True -> unique_strings_acc(rest, acc)
        False -> unique_strings_acc(rest, [first, ..acc])
      }
    }
  }
}
