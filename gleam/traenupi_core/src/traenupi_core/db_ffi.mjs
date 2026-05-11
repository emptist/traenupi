import { createRequire } from 'module';
import { join } from 'path';
import { Ok, Error as GleamError, CustomType, toList } from "../gleam.mjs";
import { Some, None } from "../../gleam_stdlib/gleam/option.mjs";
import * as dict from "../../gleam_stdlib/gleam/dict.mjs";

const require = createRequire(import.meta.url);

let pgModule = null;

function resolvePgPath() {
  const candidates = [
    join(process.cwd(), '..', '..', '..', '..', 'node_modules', 'pg'),
  ];
  const projectRoot = '/Users/jk/gits/hub/tools_ai/traenupi/node_modules/pg';
  candidates.push(projectRoot);
  for (const p of candidates) {
    try { require.resolve(p); return p; } catch {}
  }
  return 'pg';
}

function getPg() {
  if (pgModule) return pgModule;
  try {
    const mod = require(resolvePgPath());
    pgModule = mod.default || mod;
    return pgModule;
  } catch (e) {
    throw new Error(`Cannot load pg module: ${e.message}`);
  }
}

class ConnectionError extends CustomType {
  constructor($0) { super(); this[0] = $0; }
}
class QueryError extends CustomType {
  constructor($0) { super(); this[0] = $0; }
}
class ClosedError extends CustomType {}
class TimeoutError extends CustomType {}
class PoolExhausted extends CustomType {}
class InvalidConfig extends CustomType {
  constructor($0) { super(); this[0] = $0; }
}

class QueryResult extends CustomType {
  constructor(rows, row_count) { super(); this.rows = rows; this.row_count = row_count; }
}

class Healthy extends CustomType {
  constructor(latency_ms) { super(); this.latency_ms = latency_ms; }
}
class Unhealthy extends CustomType {
  constructor(error) { super(); this.error = error; }
}

export function connect(config) {
  return new Promise((resolve) => {
    try {
      const pg = getPg();
      const Pool = pg.Pool;
      const poolConfig = {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        max: config.max_connections,
        idleTimeoutMillis: config.idle_timeout_ms,
        connectionTimeoutMillis: config.connection_timeout_ms,
      };

      if (config.password instanceof Some) {
        poolConfig.password = config.password[0];
      }

      const pool = new Pool(poolConfig);

      pool.on('error', (err) => {
        console.error('[DB] Unexpected error on idle client', err);
      });

      pool.on('connect', async (client) => {
        try {
          const branch = await getGitBranch();
          if (branch) {
            await client.query(`SET app.git_branch = '${branch}'`);
          }
        } catch (e) {}
      });

      resolve(new Ok({ pool, isClosed: false }));
    } catch (e) {
      resolve(new GleamError(new ConnectionError(e.message)));
    }
  });
}

async function getGitBranch() {
  try {
    const { execSync } = await import('child_process');
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function gleamListToArray(list) {
  const arr = [];
  let current = list;
  while (current && current.head !== undefined) {
    arr.push(current.head);
    current = current.tail;
  }
  return arr;
}

function objectToGleamDict(obj) {
  const entries = [];
  for (const [key, value] of Object.entries(obj)) {
    entries.push([key, value]);
  }
  return dict.from_list(toList(entries));
}

export function query(conn, sql, params) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve(new GleamError(new ClosedError()));
      return;
    }

    try {
      const result = await conn.pool.query(sql, gleamListToArray(params));
      const rows = result.rows.map(row => {
        const dictObj = {};
        for (const [key, value] of Object.entries(row)) {
          dictObj[key] = value === null ? 'null' : String(value);
        }
        return objectToGleamDict(dictObj);
      });

      resolve(new Ok(new QueryResult(toList(rows), result.rowCount || 0)));
    } catch (e) {
      resolve(new GleamError(new QueryError(e.message)));
    }
  });
}

export function query_one(conn, sql, params) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve(new GleamError(new ClosedError()));
      return;
    }

    try {
      const result = await conn.pool.query(sql, gleamListToArray(params));
      if (result.rows.length === 0) {
        resolve(new Ok(new None()));
      } else {
        const row = result.rows[0];
        const dictObj = {};
        for (const [key, value] of Object.entries(row)) {
          dictObj[key] = value === null ? 'null' : String(value);
        }
        resolve(new Ok(new Some(objectToGleamDict(dictObj))));
      }
    } catch (e) {
      resolve(new GleamError(new QueryError(e.message)));
    }
  });
}

export function execute(conn, sql, params) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve(new GleamError(new ClosedError()));
      return;
    }

    try {
      const result = await conn.pool.query(sql, gleamListToArray(params));
      resolve(new Ok(result.rowCount || 0));
    } catch (e) {
      resolve(new GleamError(new QueryError(e.message)));
    }
  });
}

export function close(conn) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve(new Ok(null));
      return;
    }

    try {
      await conn.pool.end();
      conn.isClosed = true;
      resolve(new Ok(null));
    } catch (e) {
      resolve(new GleamError(new QueryError(e.message)));
    }
  });
}

export function get_pool_stats(conn) {
  const pool = conn.pool;
  const total = pool.totalCount || 0;
  const idle = pool.idleCount || 0;

  return {
    total_connections: total,
    idle_connections: idle,
    active_connections: total - idle,
    waiting_clients: pool.waitingCount || 0,
  };
}

export function health_check(conn) {
  return new Promise(async (resolve) => {
    const start = Date.now();
    try {
      await conn.pool.query('SELECT 1');
      resolve(new Healthy(Date.now() - start));
    } catch (e) {
      resolve(new Unhealthy(e.message));
    }
  });
}

export function set_project_context(conn, projectId) {
  return new Promise(async (resolve) => {
    try {
      if (projectId instanceof None) {
        await conn.pool.query('SELECT disable_cross_project_learning()');
      } else if (projectId[0] === 'ALL') {
        await conn.pool.query('SELECT enable_cross_project_learning()');
      } else {
        await conn.pool.query('SELECT set_project_context($1)', [projectId[0]]);
      }
      resolve(new Ok(null));
    } catch (e) {
      resolve(new GleamError(new QueryError(e.message)));
    }
  });
}

export function get_env(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return new None();
  }
  return new Some(value);
}

export function cwd() {
  try {
    return new Ok(process.cwd());
  } catch {
    return new GleamError('Failed to get current directory');
  }
}

export function run_shell_command(command, args) {
  return new Promise((resolve) => {
    try {
      const { execSync } = require('child_process');
      const argsArray = gleamListToArray(args);
      const result = execSync(`${command} ${argsArray.join(' ')}`, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      resolve(new Ok(result));
    } catch (e) {
      resolve(new GleamError(e.message));
    }
  });
}
