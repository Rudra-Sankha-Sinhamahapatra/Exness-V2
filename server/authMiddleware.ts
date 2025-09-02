import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./token";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const email = verifyToken(token);
  if (!email) return res.status(401).json({ error: "Invalid/expired session" });

  (req as any).user = { email };
  next();
}
