export async function fetch(request) {
  try {
    const response = await globalThis.fetch(request.url, {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: request.body || undefined,
    });
    
    const body = await response.text();
    
    return {
      status: response.status,
      body: body,
    };
  } catch (error) {
    return new globalThis.Error(error.message || "Network request failed");
  }
}
