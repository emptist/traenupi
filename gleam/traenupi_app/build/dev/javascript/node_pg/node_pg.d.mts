import type * as $promise from "../gleam_javascript/gleam/javascript/promise.d.mts";
import type * as $dynamic from "../gleam_stdlib/gleam/dynamic.d.mts";
import type * as $option from "../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "./gleam.d.mts";

export class Config extends _.CustomType {
  /** @deprecated */
  constructor(
    user: $option.Option$<string>,
    password: $option.Option$<string>,
    host: $option.Option$<string>,
    port: $option.Option$<number>,
    database: $option.Option$<string>,
    connection_string: $option.Option$<string>,
    ssl: $option.Option$<$dynamic.Dynamic$>,
    types: $option.Option$<$dynamic.Dynamic$>,
    statement_timeout: $option.Option$<number>,
    query_timeout: $option.Option$<number>,
    lock_timeout: $option.Option$<number>,
    application_name: $option.Option$<string>,
    connection_timeout_millis: $option.Option$<number>,
    keep_alive_initial_delay_millis: $option.Option$<number>,
    idle_in_transaction_session_timeout: $option.Option$<number>,
    client_encoding: $option.Option$<string>,
    fallback_application_name: $option.Option$<string>,
    options: $option.Option$<string>
  );
  /** @deprecated */
  user: $option.Option$<string>;
  /** @deprecated */
  password: $option.Option$<string>;
  /** @deprecated */
  host: $option.Option$<string>;
  /** @deprecated */
  port: $option.Option$<number>;
  /** @deprecated */
  database: $option.Option$<string>;
  /** @deprecated */
  connection_string: $option.Option$<string>;
  /** @deprecated */
  ssl: $option.Option$<$dynamic.Dynamic$>;
  /** @deprecated */
  types: $option.Option$<$dynamic.Dynamic$>;
  /** @deprecated */
  statement_timeout: $option.Option$<number>;
  /** @deprecated */
  query_timeout: $option.Option$<number>;
  /** @deprecated */
  lock_timeout: $option.Option$<number>;
  /** @deprecated */
  application_name: $option.Option$<string>;
  /** @deprecated */
  connection_timeout_millis: $option.Option$<number>;
  /** @deprecated */
  keep_alive_initial_delay_millis: $option.Option$<number>;
  /** @deprecated */
  idle_in_transaction_session_timeout: $option.Option$<number>;
  /** @deprecated */
  client_encoding: $option.Option$<string>;
  /** @deprecated */
  fallback_application_name: $option.Option$<string>;
  /** @deprecated */
  options: $option.Option$<string>;
}
export function Config$Config(
  user: $option.Option$<string>,
  password: $option.Option$<string>,
  host: $option.Option$<string>,
  port: $option.Option$<number>,
  database: $option.Option$<string>,
  connection_string: $option.Option$<string>,
  ssl: $option.Option$<$dynamic.Dynamic$>,
  types: $option.Option$<$dynamic.Dynamic$>,
  statement_timeout: $option.Option$<number>,
  query_timeout: $option.Option$<number>,
  lock_timeout: $option.Option$<number>,
  application_name: $option.Option$<string>,
  connection_timeout_millis: $option.Option$<number>,
  keep_alive_initial_delay_millis: $option.Option$<number>,
  idle_in_transaction_session_timeout: $option.Option$<number>,
  client_encoding: $option.Option$<string>,
  fallback_application_name: $option.Option$<string>,
  options: $option.Option$<string>,
): Config$;
export function Config$isConfig(value: Config$): boolean;
export function Config$Config$0(value: Config$): $option.Option$<string>;
export function Config$Config$user(value: Config$): $option.Option$<string>;
export function Config$Config$1(value: Config$): $option.Option$<string>;
export function Config$Config$password(value: Config$): $option.Option$<string>;
export function Config$Config$2(value: Config$): $option.Option$<string>;
export function Config$Config$host(value: Config$): $option.Option$<string>;
export function Config$Config$3(value: Config$): $option.Option$<number>;
export function Config$Config$port(value: Config$): $option.Option$<number>;
export function Config$Config$4(value: Config$): $option.Option$<string>;
export function Config$Config$database(value: Config$): $option.Option$<string>;
export function Config$Config$5(value: Config$): $option.Option$<string>;
export function Config$Config$connection_string(value: Config$): $option.Option$<
  string
>;
export function Config$Config$6(value: Config$): $option.Option$<
  $dynamic.Dynamic$
>;
export function Config$Config$ssl(value: Config$): $option.Option$<
  $dynamic.Dynamic$
>;
export function Config$Config$7(value: Config$): $option.Option$<
  $dynamic.Dynamic$
>;
export function Config$Config$types(value: Config$): $option.Option$<
  $dynamic.Dynamic$
>;
export function Config$Config$8(value: Config$): $option.Option$<number>;
export function Config$Config$statement_timeout(value: Config$): $option.Option$<
  number
>;
export function Config$Config$9(value: Config$): $option.Option$<number>;
export function Config$Config$query_timeout(value: Config$): $option.Option$<
  number
>;
export function Config$Config$10(value: Config$): $option.Option$<number>;
export function Config$Config$lock_timeout(value: Config$): $option.Option$<
  number
>;
export function Config$Config$11(value: Config$): $option.Option$<string>;
export function Config$Config$application_name(value: Config$): $option.Option$<
  string
>;
export function Config$Config$12(value: Config$): $option.Option$<number>;
export function Config$Config$connection_timeout_millis(value: Config$): $option.Option$<
  number
>;
export function Config$Config$13(value: Config$): $option.Option$<number>;
export function Config$Config$keep_alive_initial_delay_millis(value: Config$): $option.Option$<
  number
>;
export function Config$Config$14(value: Config$): $option.Option$<number>;
export function Config$Config$idle_in_transaction_session_timeout(value: Config$): $option.Option$<
  number
>;
export function Config$Config$15(value: Config$): $option.Option$<string>;
export function Config$Config$client_encoding(value: Config$): $option.Option$<
  string
>;
export function Config$Config$16(value: Config$): $option.Option$<string>;
export function Config$Config$fallback_application_name(value: Config$): $option.Option$<
  string
>;
export function Config$Config$17(value: Config$): $option.Option$<string>;
export function Config$Config$options(value: Config$): $option.Option$<string>;

export type Config$ = Config;

declare class Client extends _.CustomType {
  /** @deprecated */
  constructor(inner: $dynamic.Dynamic$);
  /** @deprecated */
  inner: $dynamic.Dynamic$;
}

export type Client$ = Client;

export class DatabaseError extends _.CustomType {
  /** @deprecated */
  constructor(
    message: string,
    code: $option.Option$<string>,
    detail: $option.Option$<string>,
    hint: $option.Option$<string>
  );
  /** @deprecated */
  message: string;
  /** @deprecated */
  code: $option.Option$<string>;
  /** @deprecated */
  detail: $option.Option$<string>;
  /** @deprecated */
  hint: $option.Option$<string>;
}
export function DatabaseError$DatabaseError(
  message: string,
  code: $option.Option$<string>,
  detail: $option.Option$<string>,
  hint: $option.Option$<string>,
): DatabaseError$;
export function DatabaseError$isDatabaseError(value: DatabaseError$): boolean;
export function DatabaseError$DatabaseError$0(value: DatabaseError$): string;
export function DatabaseError$DatabaseError$message(value: DatabaseError$): string;
export function DatabaseError$DatabaseError$1(
  value: DatabaseError$,
): $option.Option$<string>;
export function DatabaseError$DatabaseError$code(value: DatabaseError$): $option.Option$<
  string
>;
export function DatabaseError$DatabaseError$2(value: DatabaseError$): $option.Option$<
  string
>;
export function DatabaseError$DatabaseError$detail(value: DatabaseError$): $option.Option$<
  string
>;
export function DatabaseError$DatabaseError$3(value: DatabaseError$): $option.Option$<
  string
>;
export function DatabaseError$DatabaseError$hint(value: DatabaseError$): $option.Option$<
  string
>;

export type DatabaseError$ = DatabaseError;

export class QueryResult extends _.CustomType {
  /** @deprecated */
  constructor(
    rows: _.List<$dynamic.Dynamic$>,
    row_count: $option.Option$<number>,
    command: string,
    fields: $option.Option$<_.List<FieldInfo$>>
  );
  /** @deprecated */
  rows: _.List<$dynamic.Dynamic$>;
  /** @deprecated */
  row_count: $option.Option$<number>;
  /** @deprecated */
  command: string;
  /** @deprecated */
  fields: $option.Option$<_.List<FieldInfo$>>;
}
export function QueryResult$QueryResult(
  rows: _.List<$dynamic.Dynamic$>,
  row_count: $option.Option$<number>,
  command: string,
  fields: $option.Option$<_.List<FieldInfo$>>,
): QueryResult$;
export function QueryResult$isQueryResult(value: QueryResult$): boolean;
export function QueryResult$QueryResult$0(value: QueryResult$): _.List<
  $dynamic.Dynamic$
>;
export function QueryResult$QueryResult$rows(value: QueryResult$): _.List<
  $dynamic.Dynamic$
>;
export function QueryResult$QueryResult$1(value: QueryResult$): $option.Option$<
  number
>;
export function QueryResult$QueryResult$row_count(value: QueryResult$): $option.Option$<
  number
>;
export function QueryResult$QueryResult$2(value: QueryResult$): string;
export function QueryResult$QueryResult$command(value: QueryResult$): string;
export function QueryResult$QueryResult$3(value: QueryResult$): $option.Option$<
  _.List<FieldInfo$>
>;
export function QueryResult$QueryResult$fields(value: QueryResult$): $option.Option$<
  _.List<FieldInfo$>
>;

export type QueryResult$ = QueryResult;

export class FieldInfo extends _.CustomType {
  /** @deprecated */
  constructor(
    name: string,
    table_id: number,
    column_id: number,
    data_type_id: number
  );
  /** @deprecated */
  name: string;
  /** @deprecated */
  table_id: number;
  /** @deprecated */
  column_id: number;
  /** @deprecated */
  data_type_id: number;
}
export function FieldInfo$FieldInfo(
  name: string,
  table_id: number,
  column_id: number,
  data_type_id: number,
): FieldInfo$;
export function FieldInfo$isFieldInfo(value: FieldInfo$): boolean;
export function FieldInfo$FieldInfo$0(value: FieldInfo$): string;
export function FieldInfo$FieldInfo$name(value: FieldInfo$): string;
export function FieldInfo$FieldInfo$1(value: FieldInfo$): number;
export function FieldInfo$FieldInfo$table_id(value: FieldInfo$): number;
export function FieldInfo$FieldInfo$2(value: FieldInfo$): number;
export function FieldInfo$FieldInfo$column_id(value: FieldInfo$): number;
export function FieldInfo$FieldInfo$3(value: FieldInfo$): number;
export function FieldInfo$FieldInfo$data_type_id(value: FieldInfo$): number;

export type FieldInfo$ = FieldInfo;

export function empty_config(): Config$;

export function connection_string_config(connection_string: string): Config$;

export function create_config(
  user: $option.Option$<string>,
  password: $option.Option$<string>,
  host: $option.Option$<string>,
  port: $option.Option$<number>,
  database: $option.Option$<string>
): Config$;

export function new_client(config: Config$): Client$;

export function connect(client: Client$): $promise.Promise$<
  _.Result<undefined, DatabaseError$>
>;

export function end(client: Client$): $promise.Promise$<
  _.Result<undefined, DatabaseError$>
>;

export function query(
  client: Client$,
  sql: string,
  parameters: _.List<$dynamic.Dynamic$>
): $promise.Promise$<_.Result<QueryResult$, DatabaseError$>>;

export function main(): undefined;
