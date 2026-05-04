import type * as $jsonx from "../traenupi_core/jsonx.d.mts";
import type * as $schema from "../traenupi_core/schema.d.mts";

export function merge_schemas(base: $schema.Schema$, override: $schema.Schema$): $schema.Schema$;

export function make_nullable(schema: $schema.Schema$): $schema.Schema$;

export function string_schema(): $schema.Schema$;

export function number_schema(): $schema.Schema$;

export function integer_schema(): $schema.Schema$;

export function array_schema(): $schema.Schema$;

export function object_schema(): $schema.Schema$;

export function boolean_schema(): $schema.Schema$;

export function null_schema(): $schema.Schema$;

export function schema_to_json(schema: $schema.Schema$): $jsonx.JsonValue$;

export function schema_to_string(schema: $schema.Schema$): string;
