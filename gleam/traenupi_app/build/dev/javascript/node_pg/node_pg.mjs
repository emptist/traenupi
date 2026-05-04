/// <reference types="./node_pg.d.mts" />
import * as $promise from "../gleam_javascript/gleam/javascript/promise.mjs";
import * as $dynamic from "../gleam_stdlib/gleam/dynamic.mjs";
import * as $option from "../gleam_stdlib/gleam/option.mjs";
import {
  createClientInternal as create_client_internal,
  connectClient as connect,
  endClient as end,
  executeQuery as query,
} from "./ffi.mjs";
import { CustomType as $CustomType } from "./gleam.mjs";

export { connect, end, query };

export class Config extends $CustomType {
  constructor(user, password, host, port, database, connection_string, ssl, types, statement_timeout, query_timeout, lock_timeout, application_name, connection_timeout_millis, keep_alive_initial_delay_millis, idle_in_transaction_session_timeout, client_encoding, fallback_application_name, options) {
    super();
    this.user = user;
    this.password = password;
    this.host = host;
    this.port = port;
    this.database = database;
    this.connection_string = connection_string;
    this.ssl = ssl;
    this.types = types;
    this.statement_timeout = statement_timeout;
    this.query_timeout = query_timeout;
    this.lock_timeout = lock_timeout;
    this.application_name = application_name;
    this.connection_timeout_millis = connection_timeout_millis;
    this.keep_alive_initial_delay_millis = keep_alive_initial_delay_millis;
    this.idle_in_transaction_session_timeout = idle_in_transaction_session_timeout;
    this.client_encoding = client_encoding;
    this.fallback_application_name = fallback_application_name;
    this.options = options;
  }
}
export const Config$Config = (user, password, host, port, database, connection_string, ssl, types, statement_timeout, query_timeout, lock_timeout, application_name, connection_timeout_millis, keep_alive_initial_delay_millis, idle_in_transaction_session_timeout, client_encoding, fallback_application_name, options) =>
  new Config(user,
  password,
  host,
  port,
  database,
  connection_string,
  ssl,
  types,
  statement_timeout,
  query_timeout,
  lock_timeout,
  application_name,
  connection_timeout_millis,
  keep_alive_initial_delay_millis,
  idle_in_transaction_session_timeout,
  client_encoding,
  fallback_application_name,
  options);
export const Config$isConfig = (value) => value instanceof Config;
export const Config$Config$user = (value) => value.user;
export const Config$Config$0 = (value) => value.user;
export const Config$Config$password = (value) => value.password;
export const Config$Config$1 = (value) => value.password;
export const Config$Config$host = (value) => value.host;
export const Config$Config$2 = (value) => value.host;
export const Config$Config$port = (value) => value.port;
export const Config$Config$3 = (value) => value.port;
export const Config$Config$database = (value) => value.database;
export const Config$Config$4 = (value) => value.database;
export const Config$Config$connection_string = (value) =>
  value.connection_string;
export const Config$Config$5 = (value) => value.connection_string;
export const Config$Config$ssl = (value) => value.ssl;
export const Config$Config$6 = (value) => value.ssl;
export const Config$Config$types = (value) => value.types;
export const Config$Config$7 = (value) => value.types;
export const Config$Config$statement_timeout = (value) =>
  value.statement_timeout;
export const Config$Config$8 = (value) => value.statement_timeout;
export const Config$Config$query_timeout = (value) => value.query_timeout;
export const Config$Config$9 = (value) => value.query_timeout;
export const Config$Config$lock_timeout = (value) => value.lock_timeout;
export const Config$Config$10 = (value) => value.lock_timeout;
export const Config$Config$application_name = (value) => value.application_name;
export const Config$Config$11 = (value) => value.application_name;
export const Config$Config$connection_timeout_millis = (value) =>
  value.connection_timeout_millis;
export const Config$Config$12 = (value) => value.connection_timeout_millis;
export const Config$Config$keep_alive_initial_delay_millis = (value) =>
  value.keep_alive_initial_delay_millis;
export const Config$Config$13 = (value) =>
  value.keep_alive_initial_delay_millis;
export const Config$Config$idle_in_transaction_session_timeout = (value) =>
  value.idle_in_transaction_session_timeout;
export const Config$Config$14 = (value) =>
  value.idle_in_transaction_session_timeout;
export const Config$Config$client_encoding = (value) => value.client_encoding;
export const Config$Config$15 = (value) => value.client_encoding;
export const Config$Config$fallback_application_name = (value) =>
  value.fallback_application_name;
export const Config$Config$16 = (value) => value.fallback_application_name;
export const Config$Config$options = (value) => value.options;
export const Config$Config$17 = (value) => value.options;

class Client extends $CustomType {
  constructor(inner) {
    super();
    this.inner = inner;
  }
}

export class DatabaseError extends $CustomType {
  constructor(message, code, detail, hint) {
    super();
    this.message = message;
    this.code = code;
    this.detail = detail;
    this.hint = hint;
  }
}
export const DatabaseError$DatabaseError = (message, code, detail, hint) =>
  new DatabaseError(message, code, detail, hint);
export const DatabaseError$isDatabaseError = (value) =>
  value instanceof DatabaseError;
export const DatabaseError$DatabaseError$message = (value) => value.message;
export const DatabaseError$DatabaseError$0 = (value) => value.message;
export const DatabaseError$DatabaseError$code = (value) => value.code;
export const DatabaseError$DatabaseError$1 = (value) => value.code;
export const DatabaseError$DatabaseError$detail = (value) => value.detail;
export const DatabaseError$DatabaseError$2 = (value) => value.detail;
export const DatabaseError$DatabaseError$hint = (value) => value.hint;
export const DatabaseError$DatabaseError$3 = (value) => value.hint;

export class QueryResult extends $CustomType {
  constructor(rows, row_count, command, fields) {
    super();
    this.rows = rows;
    this.row_count = row_count;
    this.command = command;
    this.fields = fields;
  }
}
export const QueryResult$QueryResult = (rows, row_count, command, fields) =>
  new QueryResult(rows, row_count, command, fields);
export const QueryResult$isQueryResult = (value) =>
  value instanceof QueryResult;
export const QueryResult$QueryResult$rows = (value) => value.rows;
export const QueryResult$QueryResult$0 = (value) => value.rows;
export const QueryResult$QueryResult$row_count = (value) => value.row_count;
export const QueryResult$QueryResult$1 = (value) => value.row_count;
export const QueryResult$QueryResult$command = (value) => value.command;
export const QueryResult$QueryResult$2 = (value) => value.command;
export const QueryResult$QueryResult$fields = (value) => value.fields;
export const QueryResult$QueryResult$3 = (value) => value.fields;

export class FieldInfo extends $CustomType {
  constructor(name, table_id, column_id, data_type_id) {
    super();
    this.name = name;
    this.table_id = table_id;
    this.column_id = column_id;
    this.data_type_id = data_type_id;
  }
}
export const FieldInfo$FieldInfo = (name, table_id, column_id, data_type_id) =>
  new FieldInfo(name, table_id, column_id, data_type_id);
export const FieldInfo$isFieldInfo = (value) => value instanceof FieldInfo;
export const FieldInfo$FieldInfo$name = (value) => value.name;
export const FieldInfo$FieldInfo$0 = (value) => value.name;
export const FieldInfo$FieldInfo$table_id = (value) => value.table_id;
export const FieldInfo$FieldInfo$1 = (value) => value.table_id;
export const FieldInfo$FieldInfo$column_id = (value) => value.column_id;
export const FieldInfo$FieldInfo$2 = (value) => value.column_id;
export const FieldInfo$FieldInfo$data_type_id = (value) => value.data_type_id;
export const FieldInfo$FieldInfo$3 = (value) => value.data_type_id;

/**
 * Create an empty PostgreSQL configuration
 * All fields are set to None; node-postgres will use environment variables as defaults
 * This is useful when you want to rely entirely on environment configuration
 */
export function empty_config() {
  return new Config(
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
    new $option.None(),
  );
}

/**
 * Create a PostgreSQL configuration from a connection string
 * Connection string format: postgresql://[user[:password]@][host][:port][/database][?options]
 */
export function connection_string_config(connection_string) {
  let _record = empty_config();
  return new Config(
    _record.user,
    _record.password,
    _record.host,
    _record.port,
    _record.database,
    new $option.Some(connection_string),
    _record.ssl,
    _record.types,
    _record.statement_timeout,
    _record.query_timeout,
    _record.lock_timeout,
    _record.application_name,
    _record.connection_timeout_millis,
    _record.keep_alive_initial_delay_millis,
    _record.idle_in_transaction_session_timeout,
    _record.client_encoding,
    _record.fallback_application_name,
    _record.options,
  );
}

/**
 * Create a new PostgreSQL configuration from basic connection parameters
 * All parameters are optional; unspecified fields will be set to None
 * node-postgres will use environment variables as defaults for None values
 */
export function create_config(user, password, host, port, database) {
  let _record = empty_config();
  return new Config(
    user,
    password,
    host,
    port,
    database,
    _record.connection_string,
    _record.ssl,
    _record.types,
    _record.statement_timeout,
    _record.query_timeout,
    _record.lock_timeout,
    _record.application_name,
    _record.connection_timeout_millis,
    _record.keep_alive_initial_delay_millis,
    _record.idle_in_transaction_session_timeout,
    _record.client_encoding,
    _record.fallback_application_name,
    _record.options,
  );
}

/**
 * Create a new PostgreSQL client instance from configuration
 * The client is not connected; call connect() to establish connection
 */
export function new_client(config) {
  return new Client(create_client_internal(config));
}

export function main() {
  return undefined;
}
