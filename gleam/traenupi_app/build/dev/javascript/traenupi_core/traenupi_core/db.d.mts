import type * as $promise from "../../gleam_javascript/gleam/javascript/promise.d.mts";
import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class DbConfig extends _.CustomType {
  /** @deprecated */
  constructor(
    host: string,
    port: number,
    database: string,
    user: string,
    password: $option.Option$<string>,
    max_connections: number,
    idle_timeout_ms: number,
    connection_timeout_ms: number
  );
  /** @deprecated */
  host: string;
  /** @deprecated */
  port: number;
  /** @deprecated */
  database: string;
  /** @deprecated */
  user: string;
  /** @deprecated */
  password: $option.Option$<string>;
  /** @deprecated */
  max_connections: number;
  /** @deprecated */
  idle_timeout_ms: number;
  /** @deprecated */
  connection_timeout_ms: number;
}
export function DbConfig$DbConfig(
  host: string,
  port: number,
  database: string,
  user: string,
  password: $option.Option$<string>,
  max_connections: number,
  idle_timeout_ms: number,
  connection_timeout_ms: number,
): DbConfig$;
export function DbConfig$isDbConfig(value: DbConfig$): boolean;
export function DbConfig$DbConfig$0(value: DbConfig$): string;
export function DbConfig$DbConfig$host(value: DbConfig$): string;
export function DbConfig$DbConfig$1(value: DbConfig$): number;
export function DbConfig$DbConfig$port(value: DbConfig$): number;
export function DbConfig$DbConfig$2(value: DbConfig$): string;
export function DbConfig$DbConfig$database(value: DbConfig$): string;
export function DbConfig$DbConfig$3(value: DbConfig$): string;
export function DbConfig$DbConfig$user(value: DbConfig$): string;
export function DbConfig$DbConfig$4(value: DbConfig$): $option.Option$<string>;
export function DbConfig$DbConfig$password(value: DbConfig$): $option.Option$<
  string
>;
export function DbConfig$DbConfig$5(value: DbConfig$): number;
export function DbConfig$DbConfig$max_connections(value: DbConfig$): number;
export function DbConfig$DbConfig$6(value: DbConfig$): number;
export function DbConfig$DbConfig$idle_timeout_ms(value: DbConfig$): number;
export function DbConfig$DbConfig$7(value: DbConfig$): number;
export function DbConfig$DbConfig$connection_timeout_ms(value: DbConfig$): number;

export type DbConfig$ = DbConfig;

export type Connection$ = any;

export class ConnectionError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function DbError$ConnectionError($0: string): DbError$;
export function DbError$isConnectionError(value: DbError$): boolean;
export function DbError$ConnectionError$0(value: DbError$): string;

export class QueryError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function DbError$QueryError($0: string): DbError$;
export function DbError$isQueryError(value: DbError$): boolean;
export function DbError$QueryError$0(value: DbError$): string;

export class TimeoutError extends _.CustomType {}
export function DbError$TimeoutError(): DbError$;
export function DbError$isTimeoutError(value: DbError$): boolean;

export class PoolExhausted extends _.CustomType {}
export function DbError$PoolExhausted(): DbError$;
export function DbError$isPoolExhausted(value: DbError$): boolean;

export class InvalidConfig extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function DbError$InvalidConfig($0: string): DbError$;
export function DbError$isInvalidConfig(value: DbError$): boolean;
export function DbError$InvalidConfig$0(value: DbError$): string;

export class ClosedError extends _.CustomType {}
export function DbError$ClosedError(): DbError$;
export function DbError$isClosedError(value: DbError$): boolean;

export type DbError$ = ConnectionError | QueryError | TimeoutError | PoolExhausted | InvalidConfig | ClosedError;

export class QueryResult extends _.CustomType {
  /** @deprecated */
  constructor(rows: _.List<$dict.Dict$<string, string>>, row_count: number);
  /** @deprecated */
  rows: _.List<$dict.Dict$<string, string>>;
  /** @deprecated */
  row_count: number;
}
export function QueryResult$QueryResult(
  rows: _.List<$dict.Dict$<string, string>>,
  row_count: number,
): QueryResult$;
export function QueryResult$isQueryResult(value: QueryResult$): boolean;
export function QueryResult$QueryResult$0(value: QueryResult$): _.List<
  $dict.Dict$<string, string>
>;
export function QueryResult$QueryResult$rows(value: QueryResult$): _.List<
  $dict.Dict$<string, string>
>;
export function QueryResult$QueryResult$1(value: QueryResult$): number;
export function QueryResult$QueryResult$row_count(value: QueryResult$): number;

export type QueryResult$ = QueryResult;

export class PoolStats extends _.CustomType {
  /** @deprecated */
  constructor(
    total_connections: number,
    idle_connections: number,
    active_connections: number,
    waiting_clients: number
  );
  /** @deprecated */
  total_connections: number;
  /** @deprecated */
  idle_connections: number;
  /** @deprecated */
  active_connections: number;
  /** @deprecated */
  waiting_clients: number;
}
export function PoolStats$PoolStats(
  total_connections: number,
  idle_connections: number,
  active_connections: number,
  waiting_clients: number,
): PoolStats$;
export function PoolStats$isPoolStats(value: PoolStats$): boolean;
export function PoolStats$PoolStats$0(value: PoolStats$): number;
export function PoolStats$PoolStats$total_connections(value: PoolStats$): number;
export function PoolStats$PoolStats$1(
  value: PoolStats$,
): number;
export function PoolStats$PoolStats$idle_connections(value: PoolStats$): number;
export function PoolStats$PoolStats$2(value: PoolStats$): number;
export function PoolStats$PoolStats$active_connections(value: PoolStats$): number;
export function PoolStats$PoolStats$3(
  value: PoolStats$,
): number;
export function PoolStats$PoolStats$waiting_clients(value: PoolStats$): number;

export type PoolStats$ = PoolStats;

export class Healthy extends _.CustomType {
  /** @deprecated */
  constructor(latency_ms: number);
  /** @deprecated */
  latency_ms: number;
}
export function HealthStatus$Healthy(latency_ms: number): HealthStatus$;
export function HealthStatus$isHealthy(value: HealthStatus$): boolean;
export function HealthStatus$Healthy$0(value: HealthStatus$): number;
export function HealthStatus$Healthy$latency_ms(value: HealthStatus$): number;

export class Unhealthy extends _.CustomType {
  /** @deprecated */
  constructor(error: string);
  /** @deprecated */
  error: string;
}
export function HealthStatus$Unhealthy(error: string): HealthStatus$;
export function HealthStatus$isUnhealthy(value: HealthStatus$): boolean;
export function HealthStatus$Unhealthy$0(value: HealthStatus$): string;
export function HealthStatus$Unhealthy$error(value: HealthStatus$): string;

export type HealthStatus$ = Healthy | Unhealthy;

export function default_config(): DbConfig$;

export function config_with_password(config: DbConfig$, password: string): DbConfig$;

export function connect(config: DbConfig$): $promise.Promise$<
  _.Result<Connection$, DbError$>
>;

export function query(conn: Connection$, sql: string, params: _.List<string>): $promise.Promise$<
  _.Result<QueryResult$, DbError$>
>;

export function query_one(
  conn: Connection$,
  sql: string,
  params: _.List<string>
): $promise.Promise$<
  _.Result<$option.Option$<$dict.Dict$<string, string>>, DbError$>
>;

export function execute(conn: Connection$, sql: string, params: _.List<string>): $promise.Promise$<
  _.Result<number, DbError$>
>;

export function close(conn: Connection$): $promise.Promise$<
  _.Result<undefined, DbError$>
>;

export function get_pool_stats(conn: Connection$): $promise.Promise$<PoolStats$>;

export function health_check(conn: Connection$): $promise.Promise$<
  HealthStatus$
>;

export function set_project_context(
  conn: Connection$,
  project_id: $option.Option$<string>
): $promise.Promise$<_.Result<undefined, DbError$>>;

export function config_from_env(): _.Result<DbConfig$, DbError$>;

export function select_all(conn: Connection$, table: string): $promise.Promise$<
  _.Result<QueryResult$, DbError$>
>;

export function select_by_id(conn: Connection$, table: string, id: string): $promise.Promise$<
  _.Result<$option.Option$<$dict.Dict$<string, string>>, DbError$>
>;

export function update(
  conn: Connection$,
  table: string,
  id: string,
  columns: _.List<string>,
  values: _.List<string>
): $promise.Promise$<_.Result<number, DbError$>>;

export function delete$(conn: Connection$, table: string, id: string): $promise.Promise$<
  _.Result<number, DbError$>
>;

export function count(conn: Connection$, table: string): $promise.Promise$<
  _.Result<number, DbError$>
>;

export function exists(conn: Connection$, table: string, id: string): $promise.Promise$<
  _.Result<boolean, DbError$>
>;

export function safe_query(
  conn: Connection$,
  sql: string,
  params: _.List<string>
): $promise.Promise$<_.Result<QueryResult$, DbError$>>;

export function build_where_clause(conditions: _.List<[string, string]>): string;

export function build_order_clause(columns: _.List<string>, direction: string): string;

export function build_limit_clause(limit: number): string;

export function build_offset_clause(offset: number): string;

export function insert(
  conn: Connection$,
  table: string,
  columns: _.List<string>,
  values: _.List<string>
): $promise.Promise$<_.Result<number, DbError$>>;
