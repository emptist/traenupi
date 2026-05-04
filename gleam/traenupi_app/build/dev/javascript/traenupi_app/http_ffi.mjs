// FFI for HTTP server using Node.js built-in http module
// This provides minimal FFI for HTTP functionality

export function createServer(handler: any) {
  const http = require("http");
  return http.createServer((req: any, res: any) => {
    const gleamReq = {
      method: req.method || "GET",
      path: req.url || "/",
      headers: Object.entries(req.headers || {}),
    };
    
    handler(gleamReq)(res);
  });
}

export function listen(server: any, port: number, callback: any) {
  return server.listen(port, () => {
    if (callback) callback();
  });
}

export function writeResponse(res: any, statusCode: number, headers: any, body: string) {
  res.writeHead(statusCode, headers);
  res.end(body);
  return null;
}
