import pg from 'pg';

const { Pool } = pg;

export function connect(config) {
  return new Promise((resolve) => {
    try {
      const poolConfig = {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        max: config.max_connections,
        idleTimeoutMillis: config.idle_timeout_ms,
        connectionTimeoutMillis: config.connection_timeout_ms,
      };

      if (config.password && config.password.type === 'Some') {
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
        } catch (e) {
          // Ignore branch setting errors
        }
      });

      resolve({ type: 'Ok', value: { pool, isClosed: false } });
    } catch (e) {
      resolve({ type: 'Error', value: { ConnectionError: e.message } });
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

export function query(conn, sql, params) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve({ type: 'Error', value: { ClosedError: 'Connection is closed' } });
      return;
    }

    try {
      const result = await conn.pool.query(sql, params);
      const rows = result.rows.map(row => {
        const dict = {};
        for (const [key, value] of Object.entries(row)) {
          dict[key] = value === null ? 'null' : String(value);
        }
        return dict;
      });

      resolve({
        type: 'Ok',
        value: {
          rows: rows,
          row_count: result.rowCount || 0,
        },
      });
    } catch (e) {
      resolve({ type: 'Error', value: { QueryError: e.message } });
    }
  });
}

export function query_one(conn, sql, params) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve({ type: 'Error', value: { ClosedError: 'Connection is closed' } });
      return;
    }

    try {
      const result = await conn.pool.query(sql, params);
      if (result.rows.length === 0) {
        resolve({ type: 'Ok', value: { type: 'None' } });
      } else {
        const row = result.rows[0];
        const dict = {};
        for (const [key, value] of Object.entries(row)) {
          dict[key] = value === null ? 'null' : String(value);
        }
        resolve({ type: 'Ok', value: { type: 'Some', value: dict } });
      }
    } catch (e) {
      resolve({ type: 'Error', value: { QueryError: e.message } });
    }
  });
}

export function execute(conn, sql, params) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve({ type: 'Error', value: { ClosedError: 'Connection is closed' } });
      return;
    }

    try {
      const result = await conn.pool.query(sql, params);
      resolve({ type: 'Ok', value: result.rowCount || 0 });
    } catch (e) {
      resolve({ type: 'Error', value: { QueryError: e.message } });
    }
  });
}

export function close(conn) {
  return new Promise(async (resolve) => {
    if (conn.isClosed) {
      resolve({ type: 'Ok', value: null });
      return;
    }

    try {
      await conn.pool.end();
      conn.isClosed = true;
      resolve({ type: 'Ok', value: null });
    } catch (e) {
      resolve({ type: 'Error', value: { QueryError: e.message } });
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
      resolve({ Healthy: Date.now() - start });
    } catch (e) {
      resolve({ Unhealthy: e.message });
    }
  });
}

export function set_project_context(conn, projectId) {
  return new Promise(async (resolve) => {
    try {
      if (projectId.type === 'None') {
        await conn.pool.query('SELECT disable_cross_project_learning()');
      } else if (projectId.value === 'ALL') {
        await conn.pool.query('SELECT enable_cross_project_learning()');
      } else {
        await conn.pool.query('SELECT set_project_context($1)', [projectId.value]);
      }
      resolve({ type: 'Ok', value: null });
    } catch (e) {
      resolve({ type: 'Error', value: { QueryError: e.message } });
    }
  });
}

export function get_env(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return { type: 'None' };
  }
  return { type: 'Some', value };
}

export function cwd() {
  try {
    return { type: 'Ok', value: process.cwd() };
  } catch {
    return { type: 'Error', value: 'Failed to get current directory' };
  }
}

export function run_shell_command(command, args) {
  return new Promise((resolve) => {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`${command} ${args.join(' ')}`, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      resolve({ type: 'Ok', value: result });
    } catch (e) {
      resolve({ type: 'Error', value: e.message });
    }
  });
}
