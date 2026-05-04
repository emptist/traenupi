/// <reference types="./db.d.mts" />
import * as $promise from "../../gleam_javascript/gleam/javascript/promise.mjs";
import { await$, resolve } from "../../gleam_javascript/gleam/javascript/promise.mjs";
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
} from "../gleam.mjs";
import {
  connect,
  query,
  query_one,
  execute,
  close,
  get_pool_stats,
  health_check,
  set_project_context,
  get_env,
} from "./db_ffi.mjs";

export {
  close,
  connect,
  execute,
  get_pool_stats,
  health_check,
  query,
  query_one,
  set_project_context,
};

export class DbConfig extends $CustomType {
  constructor(host, port, database, user, password, max_connections, idle_timeout_ms, connection_timeout_ms) {
    super();
    this.host = host;
    this.port = port;
    this.database = database;
    this.user = user;
    this.password = password;
    this.max_connections = max_connections;
    this.idle_timeout_ms = idle_timeout_ms;
    this.connection_timeout_ms = connection_timeout_ms;
  }
}
export const DbConfig$DbConfig = (host, port, database, user, password, max_connections, idle_timeout_ms, connection_timeout_ms) =>
  new DbConfig(host,
  port,
  database,
  user,
  password,
  max_connections,
  idle_timeout_ms,
  connection_timeout_ms);
export const DbConfig$isDbConfig = (value) => value instanceof DbConfig;
export const DbConfig$DbConfig$host = (value) => value.host;
export const DbConfig$DbConfig$0 = (value) => value.host;
export const DbConfig$DbConfig$port = (value) => value.port;
export const DbConfig$DbConfig$1 = (value) => value.port;
export const DbConfig$DbConfig$database = (value) => value.database;
export const DbConfig$DbConfig$2 = (value) => value.database;
export const DbConfig$DbConfig$user = (value) => value.user;
export const DbConfig$DbConfig$3 = (value) => value.user;
export const DbConfig$DbConfig$password = (value) => value.password;
export const DbConfig$DbConfig$4 = (value) => value.password;
export const DbConfig$DbConfig$max_connections = (value) =>
  value.max_connections;
export const DbConfig$DbConfig$5 = (value) => value.max_connections;
export const DbConfig$DbConfig$idle_timeout_ms = (value) =>
  value.idle_timeout_ms;
export const DbConfig$DbConfig$6 = (value) => value.idle_timeout_ms;
export const DbConfig$DbConfig$connection_timeout_ms = (value) =>
  value.connection_timeout_ms;
export const DbConfig$DbConfig$7 = (value) => value.connection_timeout_ms;

export class ConnectionError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const DbError$ConnectionError = ($0) => new ConnectionError($0);
export const DbError$isConnectionError = (value) =>
  value instanceof ConnectionError;
export const DbError$ConnectionError$0 = (value) => value[0];

export class QueryError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const DbError$QueryError = ($0) => new QueryError($0);
export const DbError$isQueryError = (value) => value instanceof QueryError;
export const DbError$QueryError$0 = (value) => value[0];

export class TimeoutError extends $CustomType {}
export const DbError$TimeoutError = () => new TimeoutError();
export const DbError$isTimeoutError = (value) => value instanceof TimeoutError;

export class PoolExhausted extends $CustomType {}
export const DbError$PoolExhausted = () => new PoolExhausted();
export const DbError$isPoolExhausted = (value) =>
  value instanceof PoolExhausted;

export class InvalidConfig extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const DbError$InvalidConfig = ($0) => new InvalidConfig($0);
export const DbError$isInvalidConfig = (value) =>
  value instanceof InvalidConfig;
export const DbError$InvalidConfig$0 = (value) => value[0];

export class ClosedError extends $CustomType {}
export const DbError$ClosedError = () => new ClosedError();
export const DbError$isClosedError = (value) => value instanceof ClosedError;

export class QueryResult extends $CustomType {
  constructor(rows, row_count) {
    super();
    this.rows = rows;
    this.row_count = row_count;
  }
}
export const QueryResult$QueryResult = (rows, row_count) =>
  new QueryResult(rows, row_count);
export const QueryResult$isQueryResult = (value) =>
  value instanceof QueryResult;
export const QueryResult$QueryResult$rows = (value) => value.rows;
export const QueryResult$QueryResult$0 = (value) => value.rows;
export const QueryResult$QueryResult$row_count = (value) => value.row_count;
export const QueryResult$QueryResult$1 = (value) => value.row_count;

export class PoolStats extends $CustomType {
  constructor(total_connections, idle_connections, active_connections, waiting_clients) {
    super();
    this.total_connections = total_connections;
    this.idle_connections = idle_connections;
    this.active_connections = active_connections;
    this.waiting_clients = waiting_clients;
  }
}
export const PoolStats$PoolStats = (total_connections, idle_connections, active_connections, waiting_clients) =>
  new PoolStats(total_connections,
  idle_connections,
  active_connections,
  waiting_clients);
export const PoolStats$isPoolStats = (value) => value instanceof PoolStats;
export const PoolStats$PoolStats$total_connections = (value) =>
  value.total_connections;
export const PoolStats$PoolStats$0 = (value) => value.total_connections;
export const PoolStats$PoolStats$idle_connections = (value) =>
  value.idle_connections;
export const PoolStats$PoolStats$1 = (value) => value.idle_connections;
export const PoolStats$PoolStats$active_connections = (value) =>
  value.active_connections;
export const PoolStats$PoolStats$2 = (value) => value.active_connections;
export const PoolStats$PoolStats$waiting_clients = (value) =>
  value.waiting_clients;
export const PoolStats$PoolStats$3 = (value) => value.waiting_clients;

export class Healthy extends $CustomType {
  constructor(latency_ms) {
    super();
    this.latency_ms = latency_ms;
  }
}
export const HealthStatus$Healthy = (latency_ms) => new Healthy(latency_ms);
export const HealthStatus$isHealthy = (value) => value instanceof Healthy;
export const HealthStatus$Healthy$latency_ms = (value) => value.latency_ms;
export const HealthStatus$Healthy$0 = (value) => value.latency_ms;

export class Unhealthy extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const HealthStatus$Unhealthy = (error) => new Unhealthy(error);
export const HealthStatus$isUnhealthy = (value) => value instanceof Unhealthy;
export const HealthStatus$Unhealthy$error = (value) => value.error;
export const HealthStatus$Unhealthy$0 = (value) => value.error;

export function default_config() {
  return new DbConfig(
    "localhost",
    5432,
    "traenupi",
    "postgres",
    new None(),
    10,
    30000,
    5000,
  );
}

export function config_with_password(config, password) {
  return new DbConfig(
    config.host,
    config.port,
    config.database,
    config.user,
    new Some(password),
    config.max_connections,
    config.idle_timeout_ms,
    config.connection_timeout_ms,
  );
}

export function config_from_env() {
  let host = $option.unwrap(get_env("DB_HOST"), "localhost");
  let _block;
  let $ = get_env("DB_PORT");
  if ($ instanceof Some) {
    let p = $[0];
    let $1 = $int.parse(p);
    if ($1 instanceof Ok) {
      let n = $1[0];
      _block = n;
    } else {
      _block = 5432;
    }
  } else {
    _block = 5432;
  }
  let port = _block;
  let database = $option.unwrap(get_env("DB_NAME"), "traenupi");
  let user = $option.unwrap(get_env("DB_USER"), "postgres");
  let password = get_env("DB_PASSWORD");
  let _block$1;
  let $1 = get_env("DB_MAX_CONNECTIONS");
  if ($1 instanceof Some) {
    let m = $1[0];
    let $2 = $int.parse(m);
    if ($2 instanceof Ok) {
      let n = $2[0];
      _block$1 = n;
    } else {
      _block$1 = 10;
    }
  } else {
    _block$1 = 10;
  }
  let max_conn = _block$1;
  return new Ok(
    new DbConfig(host, port, database, user, password, max_conn, 30000, 5000),
  );
}

export function select_all(conn, table) {
  let sql = "SELECT * FROM " + table;
  return query(conn, sql, toList([]));
}

export function select_by_id(conn, table, id) {
  let sql = ("SELECT * FROM " + table) + " WHERE id = $1";
  return query_one(conn, sql, toList([id]));
}

export function update(conn, table, id, columns, values) {
  let _block;
  let _pipe = $list.index_map(
    columns,
    (col, idx) => { return (col + " = $") + $int.to_string(idx + 1); },
  );
  _block = $string.join(_pipe, ", ");
  let sets = _block;
  let sql = (((("UPDATE " + table) + " SET ") + sets) + " WHERE id = $") + $int.to_string(
    $list.length(columns) + 1,
  );
  return execute(conn, sql, $list.append(values, toList([id])));
}

export function delete$(conn, table, id) {
  let sql = ("DELETE FROM " + table) + " WHERE id = $1";
  return execute(conn, sql, toList([id]));
}

export function count(conn, table) {
  let sql = "SELECT COUNT(*) as count FROM " + table;
  return await$(
    query_one(conn, sql, toList([])),
    (result) => {
      if (result instanceof Ok) {
        let $ = result[0];
        if ($ instanceof Some) {
          let row = $[0];
          let $1 = $dict.get(row, "count");
          if ($1 instanceof Ok) {
            let count_str = $1[0];
            let $2 = $int.parse(count_str);
            if ($2 instanceof Ok) {
              let n = $2[0];
              return resolve(new Ok(n));
            } else {
              return resolve(new Error(new QueryError("Invalid count value")));
            }
          } else {
            return resolve(new Error(new QueryError("Missing count field")));
          }
        } else {
          return resolve(new Ok(0));
        }
      } else {
        let e = result[0];
        return resolve(new Error(e));
      }
    },
  );
}

export function exists(conn, table, id) {
  let sql = ("SELECT 1 FROM " + table) + " WHERE id = $1 LIMIT 1";
  return await$(
    query_one(conn, sql, toList([id])),
    (result) => {
      if (result instanceof Ok) {
        let $ = result[0];
        if ($ instanceof Some) {
          return resolve(new Ok(true));
        } else {
          return resolve(new Ok(false));
        }
      } else {
        let e = result[0];
        return resolve(new Error(e));
      }
    },
  );
}

function sanitize_sql(sql) {
  let _pipe = sql;
  let _pipe$1 = $string.trim(_pipe);
  return ((s) => {
    let $ = $string.length(s) > 1000;
    if ($) {
      return $string.slice(s, 0, 1000) + "...";
    } else {
      return s;
    }
  })(_pipe$1);
}

export function safe_query(conn, sql, params) {
  let sanitized = sanitize_sql(sql);
  return query(conn, sanitized, params);
}

export function build_where_clause(conditions) {
  if (conditions instanceof $Empty) {
    return "";
  } else {
    let _block;
    let _pipe = conditions;
    let _pipe$1 = $list.index_map(
      _pipe,
      (cond, idx) => {
        let col;
        col = cond[0];
        return (col + " = $") + $int.to_string(idx + 1);
      },
    );
    _block = $string.join(_pipe$1, " AND ");
    let clauses = _block;
    return " WHERE " + clauses;
  }
}

export function build_order_clause(columns, direction) {
  if (columns instanceof $Empty) {
    return "";
  } else {
    let cols = $string.join(columns, ", ");
    return ((" ORDER BY " + cols) + " ") + direction;
  }
}

export function build_limit_clause(limit) {
  return " LIMIT " + $int.to_string(limit);
}

export function build_offset_clause(offset) {
  return " OFFSET " + $int.to_string(offset);
}

function range_list(start, count) {
  if (count === 0) {
    return toList([]);
  } else {
    let n = count;
    return listPrepend(start, range_list(start + 1, n - 1));
  }
}

export function insert(conn, table, columns, values) {
  let cols = $string.join(columns, ", ");
  let _block;
  let _pipe = range_list(1, $list.length(columns));
  let _pipe$1 = $list.map(_pipe, (i) => { return "$" + $int.to_string(i); });
  _block = $string.join(_pipe$1, ", ");
  let placeholders = _block;
  let sql = ((((("INSERT INTO " + table) + " (") + cols) + ") VALUES (") + placeholders) + ")";
  return execute(conn, sql, values);
}
