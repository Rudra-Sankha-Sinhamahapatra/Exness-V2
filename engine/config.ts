import dotenv from "dotenv"
dotenv.config();

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
export const assets = ["SOL_USDC", "BTC_USDC", "ETH_USDC"];
export const SNAPSHOT_URL = process.env.SNAPSHOT_URL || '';
