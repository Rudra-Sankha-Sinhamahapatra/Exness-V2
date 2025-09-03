import Redis from "ioredis";
import { REDIS_URL } from "./config";

export const redis = new Redis(REDIS_URL);
export const REDIS_SUB = new Redis(REDIS_URL);
export const TRADE_QUEUE = new Redis(REDIS_URL);