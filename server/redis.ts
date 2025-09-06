import Redis from "ioredis";
import { REDIS_URL } from "./config";

export const REDIS_PUSH_QUEUE = new Redis(REDIS_URL);
export const REDIS_RECEIVE_QUEUE = new Redis(REDIS_URL);
export const redis = new Redis(REDIS_URL);