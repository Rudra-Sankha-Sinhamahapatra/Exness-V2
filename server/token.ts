import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config";

const TOKEN_EXPIRY = "5m"; 
const COOKIE_EXPIRY = "7d";

export const generateLinkToken = (email:string) => {
  return jwt.sign({email},JWT_SECRET, { expiresIn: TOKEN_EXPIRY } )
}

export const generateSessionToken = (email: string) => {
 const token = jwt.sign({ email },JWT_SECRET, { expiresIn: COOKIE_EXPIRY })
 console.log("sessionToken:",token)
 return token;
}

export const verifyToken = (token:string) => {
  try {
    const decoded = jwt.verify(token,JWT_SECRET) as { email: string };
    return decoded.email;
  } catch (error) {
    return null;
  }
}