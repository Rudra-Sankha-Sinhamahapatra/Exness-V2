import { verifyToken } from "./token";

export const authMiddleware = async (
  req: Request,
  handler: (req: Request) => Promise<Response>
): Promise<Response> => {
  const token =  (req as any).cookies?.authToken;
    if (!token) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const email = verifyToken(token);
  if (!email) {
    return new Response(JSON.stringify({ error: "Invalid/expired session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }


  (req as any).user = { email };
  return handler(req);
}
