/**
 * Lively-Puter Bridge FFI for Gleam
 * 
 * This module provides the JavaScript implementation for Gleam bindings
 */

import { LivelyPuterBridge } from '../../src/common/lively-puter/index.js';

let bridge = null;

/**
 * Initialize the bridge
 */
export async function initialize(config) {
  try {
    const mode = config.mode === 0 ? 'lively-first' : 
                 config.mode === 1 ? 'puter-first' : 'hybrid';
    
    bridge = new LivelyPuterBridge({
      mode,
      enableAuth: config.enable_auth,
      enableAI: config.enable_ai,
      enableStorage: config.enable_storage,
      enableDatabase: config.enable_database
    });
    
    await bridge.initialize();
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

/**
 * Get current mode
 */
export function getMode() {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  const mode = bridge.getMode();
  const modeMap = {
    'lively-first': 0,
    'puter-first': 1,
    'hybrid': 2
  };
  
  return { Ok: modeMap[mode] };
}

// === File System Operations ===

export async function writeFile(path, content) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    await bridge.fs.write(path, content);
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function readFile(path) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const content = await bridge.fs.read(path);
    return { Ok: content };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function deleteFile(path) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    await bridge.fs.delete(path);
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function fileExists(path) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const exists = await bridge.fs.exists(path);
    return { Ok: exists };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function listDirectory(path) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const files = await bridge.fs.readdir(path);
    return { Ok: files };
  } catch (error) {
    return { Error: error.message };
  }
}

// === AI Operations ===

export async function chat(messages) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const formattedMessages = messages.map(msg => {
      if (msg.SystemMessage) {
        return { role: 'system', content: msg.SystemMessage.content };
      } else if (msg.UserMessage) {
        return { role: 'user', content: msg.UserMessage.content };
      } else {
        return { role: 'assistant', content: msg.AssistantMessage.content };
      }
    });
    
    const response = await bridge.ai.chat(formattedMessages);
    return { Ok: response };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function chatWithOptions(messages, model, temperature) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const formattedMessages = messages.map(msg => {
      if (msg.SystemMessage) {
        return { role: 'system', content: msg.SystemMessage.content };
      } else if (msg.UserMessage) {
        return { role: 'user', content: msg.UserMessage.content };
      } else {
        return { role: 'assistant', content: msg.AssistantMessage.content };
      }
    });
    
    const response = await bridge.ai.chat(formattedMessages, {
      model,
      temperature
    });
    return { Ok: response };
  } catch (error) {
    return { Error: error.message };
  }
}

// === Database Operations ===

export async function dbSet(key, value) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    await bridge.db.set(key, value);
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function dbGet(key) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const value = await bridge.db.get(key);
    return { Ok: value };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function dbDelete(key) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    await bridge.db.delete(key);
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function dbList(prefix) {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const items = await bridge.db.list(prefix);
    return { Ok: items };
  } catch (error) {
    return { Error: error.message };
  }
}

// === Authentication Operations ===

export async function signIn() {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const user = await bridge.auth.signIn();
    return { Ok: user };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function signOut() {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    await bridge.auth.signOut();
    return { Ok: null };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function getUser() {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const user = await bridge.auth.getUser();
    return { Ok: user };
  } catch (error) {
    return { Error: error.message };
  }
}

export async function isSignedIn() {
  if (!bridge) {
    return { Error: 'Bridge not initialized' };
  }
  
  try {
    const signedIn = await bridge.auth.isSignedIn();
    return { Ok: signedIn };
  } catch (error) {
    return { Error: error.message };
  }
}
