export async function fetch(request) {
  try {
    // DEBUG: Log request details (without sensitive data)
    console.error('[HTTP] Request URL:', request.url);
    console.error('[HTTP] Method:', typeof request.method, JSON.stringify(request.method));
    
    // Convert Gleam Dict headers to JavaScript object
    const headers = {};
    if (request.headers && typeof request.headers === 'object') {
      // Gleam Dict - iterate and extract key-value pairs
      const entries = Object.entries(request.headers);
      console.error('[HTTP] Headers entries count:', entries.length);
      for (const [key, value] of entries) {
        // Skip internal Gleam properties
        if (!key.startsWith('__') && typeof value === 'string') {
          headers[key] = value;
          console.error('[HTTP] Header:', key, '=<hidden>');
        }
      }
    }

    // Convert Gleam HTTP method enum to string
    let method = 'post';  // Default to POST for API calls
    if (request.method) {
      if (typeof request.method === 'string') {
        method = request.method.toLowerCase();
      } else {
        // Gleam enum - use default POST
        method = 'post';
      }
    }
    
    console.error('[HTTP] Final method:', method);

    const response = await globalThis.fetch(request.url, {
      method: method,
      headers: headers,
      body: request.body || undefined,
    });
    
    const text = await response.text();
    console.error('[HTTP] Response status:', response.status);
    
    // Log first 200 chars of body for debugging (no secrets)
    if (text) {
      console.error('[HTTP] Body preview:', text.substring(0, 200));
    }
    
    return {
      status: response.status,
      body: text,
    };
  } catch (error) {
    const errorMsg = error.message || error.toString() || "Network request failed";
    console.error('[HTTP] Error:', errorMsg);
    throw new Error(errorMsg);
  }
}
