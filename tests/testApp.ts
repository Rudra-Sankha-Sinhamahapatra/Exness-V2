import { Server } from 'http';
import { router } from "../server/routes/routes";

export function createTestApp() {
  const requestListener = async (req: any, res: any) => {
    try {
      let body = null;
      
      // Get request body for POST requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString();
        if (rawBody) {
          body = rawBody;
        }
      }

      const request = new Request(new URL(req.url, 'http://localhost'), {
        method: req.method,
        headers: req.headers,
        body: body,
        duplex: 'half'
      } as RequestInit);

      (request as any).cookies = { authToken: 'test-token' };
      (request as any).user = { email: 'test@gmail.com' };

      const response = await router(request);

      // Convert fetch Response to node response
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const responseBody = await response.text();
      res.end(responseBody);
    } catch (error) {
      console.error('Test server error:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  };

  // Create and return a proper server instance
  const server = new Server(requestListener);
  return server;
}