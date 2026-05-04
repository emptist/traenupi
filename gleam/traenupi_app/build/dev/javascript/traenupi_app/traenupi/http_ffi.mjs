// FFI for HTTP server using Node.js built-in http module
// Integrates with Glen framework using convert_request and convert_response

import http from "http";

export function createServer(port, handler) {
  const server = http.createServer(async (nodeReq, nodeRes) => {
    try {
      // Create a standard JavaScript Request object
      const url = `http://localhost:${port}${nodeReq.url}`;
      
      // Collect request body
      const chunks = [];
      for await (const chunk of nodeReq) {
        chunks.push(chunk);
      }
      const bodyBuffer = Buffer.concat(chunks);
      
      // Create standard Request object
      const jsRequest = new Request(url, {
        method: nodeReq.method,
        headers: nodeReq.headers,
        body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
      });
      
      // Call the Glen handler with the JS Request
      const jsResponse = await handler(jsRequest);
      
      // Convert JS Response to Node.js response
      const responseBody = await jsResponse.text();
      
      // Send response
      nodeRes.writeHead(jsResponse.status, Object.fromEntries(jsResponse.headers));
      nodeRes.end(responseBody);
    } catch (error) {
      console.error("Request handler error:", error);
      console.error(error.stack);
      nodeRes.writeHead(500, { "content-type": "application/json" });
      nodeRes.end(JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        stack: error.stack
      }));
    }
  });

  server.listen(port, () => {
    console.log(`✓ HTTP server started on port ${port}`);
  });

  return null;
}
