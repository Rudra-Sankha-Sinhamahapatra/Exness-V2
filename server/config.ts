import dotenv from "dotenv"
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const UserEmail = process.env.EMAIL_USER || "";
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8002";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const PORT = 8002;
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
export const NODE_ENV = process.env.NODE_ENV || "dev"