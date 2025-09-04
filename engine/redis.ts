import Redis from "ioredis";
import { REDIS_URL } from "./config";

export const redis = new Redis(REDIS_URL);

export const REDIS_TRADE_RECEIVE_QUEUE = new Redis(REDIS_URL);
export const REDIS_WALLET_RECEIVE_QUEUE = new Redis(REDIS_URL);

export const REDIS_SENDER_QUEUE = new Redis(REDIS_URL);