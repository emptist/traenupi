export function systemTime() {
  return Date.now();
}

export function getEnv(key) {
  return process.env[key] || "";
}

export function saveToLocal(baseDir, filename, data) {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(baseDir.replace('~', require('os').homedir()), filename);
    
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, data, 'utf-8');
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

export function loadFromLocal(baseDir, filename) {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(baseDir.replace('~', require('os').homedir()), filename);
    
    if (!fs.existsSync(fullPath)) {
      return { Error: 'File not found: ' + filename };
    }
    
    const data = fs.readFileSync(fullPath, 'utf-8');
    return { Ok: data };
  } catch (error) {
    return { Error: error.message };
  }
}

export function deleteFromLocal(baseDir, filename) {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(baseDir.replace('~', require('os').homedir()), filename);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

let postgresPool = null;

export function createPostgresPool(config) {
  try {
    const { Pool } = require('pg');
    
    postgresPool = new Pool({
      host: config.host,
      user: config.user,
      database: config.database,
      password: config.password?.[0] || undefined,
      port: config.port,
    });
    
    return { Ok: postgresPool };
  } catch (error) {
    return { Error: error.message };
  }
}

export function postgresQuery(pool, sql, params) {
  return new Promise((resolve) => {
    pool.query(sql, params)
      .then(result => {
        const rows = result.rows.map(row => {
          const dict = {};
          for (const [key, value] of Object.entries(row)) {
            dict[key] = String(value);
          }
          return dict;
        });
        resolve({ Ok: { rows } });
      })
      .catch(error => {
        resolve({ Error: error.message });
      });
  });
}

export function postgresExec(pool, sql, params) {
  return new Promise((resolve) => {
    pool.query(sql, params)
      .then(() => resolve({ Ok: null }))
      .catch(error => resolve({ Error: error.message }));
  });
}

export function postgresKvGet(pool, key) {
  return new Promise((resolve) => {
    pool.query('SELECT value FROM traenupi_kv WHERE key = $1', [key])
      .then(result => {
        if (result.rows.length > 0) {
          resolve({ Ok: result.rows[0].value });
        } else {
          resolve({ Error: 'Key not found: ' + key });
        }
      })
      .catch(error => resolve({ Error: error.message }));
  });
}

export function postgresKvSet(pool, key, value) {
  return new Promise((resolve) => {
    const sql = `
      INSERT INTO traenupi_kv (key, value, updated_at) 
      VALUES ($1, $2, NOW()) 
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, updated_at = NOW()
    `;
    
    pool.query(sql, [key, value])
      .then(() => resolve({ Ok: null }))
      .catch(error => resolve({ Error: error.message }));
  });
}

export function postgresKvDelete(pool, key) {
  return new Promise((resolve) => {
    pool.query('DELETE FROM traenupi_kv WHERE key = $1', [key])
      .then(() => resolve({ Ok: null }))
      .catch(error => resolve({ Error: error.message }));
  });
}

export function postgresKvList(pool, prefix) {
  return new Promise((resolve) => {
    const sql = prefix
      ? 'SELECT key, value FROM traenupi_kv WHERE key LIKE $1'
      : 'SELECT key, value FROM traenupi_kv';
    
    const params = prefix ? [prefix + '%'] : [];
    
    pool.query(sql, params)
      .then(result => {
        const items = result.rows.map(row => [row.key, row.value]);
        resolve({ Ok: items });
      })
      .catch(error => resolve({ Error: error.message }));
  });
}

export function closePostgresPool(pool) {
  return new Promise((resolve) => {
    pool.end()
      .then(() => resolve({ Ok: null }))
      .catch(error => resolve({ Error: error.message }));
  });
}
