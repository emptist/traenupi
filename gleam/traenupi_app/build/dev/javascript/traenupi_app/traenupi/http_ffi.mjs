// FFI for HTTP server using Node.js built-in http module
// Uses Node.js subpath imports for cleaner Gleam imports

import http from "http";

export function createServer(handler) {
  return http.createServer((req, res) => {
    const gleamReq = {
      method: req.method || "GET",
      path: req.url || "/",
      headers: Object.entries(req.headers || {}),
    };
    
    handler(gleamReq)(res);
  });
}

export function listen(server, port, callback) {
  return server.listen(port, () => {
    if (callback) callback();
  });
}

export function writeResponse(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
  return null;
}
