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

export function callOpenAIApi(apiKey, baseUrl, model, prompt, maxTokens, temperature) {
  return new Promise((resolve) => {
    const https = require('https');
    
    const url = baseUrl && baseUrl[0]
      ? baseUrl[0]
      : 'https://api.openai.com/v1';
    
    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature,
    });
    
    const options = {
      hostname: new URL(url).hostname,
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.choices && response.choices[0]) {
            resolve({ Ok: response.choices[0].message.content });
          } else {
            resolve({ Error: 'Invalid response from OpenAI' });
          }
        } catch (error) {
          resolve({ Error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ Error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}

export function getCurrentTime() {
  return Date.now();
}

export function callAnthropicApi(apiKey, model, prompt, maxTokens, temperature) {
  return new Promise((resolve) => {
    const https = require('https');
    
    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    });
    
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.content && response.content[0]) {
            resolve({ Ok: response.content[0].text });
          } else {
            resolve({ Error: 'Invalid response from Anthropic' });
          }
        } catch (error) {
          resolve({ Error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ Error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}

export function callLocalApi(baseUrl, model, prompt, maxTokens, temperature) {
  return new Promise((resolve) => {
    const http = require('http');
    
    const url = baseUrl && baseUrl[0]
      ? baseUrl[0]
      : 'http://localhost:11434';
    
    const data = JSON.stringify({
      model: model,
      prompt: prompt,
      options: {
        num_predict: maxTokens,
        temperature: temperature,
      },
    });
    
    const options = {
      hostname: new URL(url).hostname,
      port: new URL(url).port || 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const lines = body.split('\n').filter(line => line.trim());
          let response = '';
          for (const line of lines) {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              response += parsed.response;
            }
          }
          resolve({ Ok: response });
        } catch (error) {
          resolve({ Error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ Error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}

export function callOpenAIChatApi(apiKey, baseUrl, model, messages, maxTokens, temperature) {
  return new Promise((resolve) => {
    const https = require('https');
    
    const url = baseUrl && baseUrl[0]
      ? baseUrl[0]
      : 'https://api.openai.com/v1';
    
    const formattedMessages = messages.map(msg => {
      if (msg.type === 'SystemMessage') {
        return { role: 'system', content: msg[0] };
      } else if (msg.type === 'UserMessage') {
        return { role: 'user', content: msg[0] };
      } else if (msg.type === 'AssistantMessage') {
        return { role: 'assistant', content: msg[0] };
      }
      return msg;
    });
    
    const data = JSON.stringify({
      model: model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature: temperature,
    });
    
    const options = {
      hostname: new URL(url).hostname,
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.choices && response.choices[0]) {
            resolve({ Ok: response.choices[0].message.content });
          } else {
            resolve({ Error: 'Invalid response from OpenAI' });
          }
        } catch (error) {
          resolve({ Error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ Error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}

export function callAnthropicChatApi(apiKey, model, messages, maxTokens, temperature) {
  return new Promise((resolve) => {
    const https = require('https');
    
    const systemMessage = messages.find(msg => msg.type === 'SystemMessage');
    const otherMessages = messages.filter(msg => msg.type !== 'SystemMessage');
    
    const formattedMessages = otherMessages.map(msg => {
      if (msg.type === 'UserMessage') {
        return { role: 'user', content: msg[0] };
      } else if (msg.type === 'AssistantMessage') {
        return { role: 'assistant', content: msg[0] };
      }
      return msg;
    });
    
    const requestData = {
      model: model,
      messages: formattedMessages,
      max_tokens: maxTokens,
    };
    
    if (systemMessage) {
      requestData.system = systemMessage[0];
    }
    
    const data = JSON.stringify(requestData);
    
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.content && response.content[0]) {
            resolve({ Ok: response.content[0].text });
          } else {
            resolve({ Error: 'Invalid response from Anthropic' });
          }
        } catch (error) {
          resolve({ Error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ Error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}

export function callLocalChatApi(baseUrl, model, messages, maxTokens, temperature) {
  return new Promise((resolve) => {
    const http = require('http');
    
    const url = baseUrl && baseUrl[0]
      ? baseUrl[0]
      : 'http://localhost:11434';
    
    const formattedMessages = messages.map(msg => {
      if (msg.type === 'SystemMessage') {
        return { role: 'system', content: msg[0] };
      } else if (msg.type === 'UserMessage') {
        return { role: 'user', content: msg[0] };
      } else if (msg.type === 'AssistantMessage') {
        return { role: 'assistant', content: msg[0] };
      }
      return msg;
    });
    
    const data = JSON.stringify({
      model: model,
      messages: formattedMessages,
      stream: false,
      options: {
        num_predict: maxTokens,
        temperature: temperature,
      },
    });
    
    const options = {
      hostname: new URL(url).hostname,
      port: new URL(url).port || 11434,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.message && response.message.content) {
            resolve({ Ok: response.message.content });
          } else {
            resolve({ Error: 'Invalid response from local API' });
          }
        } catch (error) {
          resolve({ Error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ Error: error.message });
    });
    
    req.write(data);
    req.end();
  });
}
