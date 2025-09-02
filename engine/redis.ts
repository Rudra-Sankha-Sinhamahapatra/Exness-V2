import Redis from "ioredis";
import { REDIS_URL } from "./config";

export const redis = new Redis(REDIS_URL);

export const REDIS_QUEUE = new Redis(REDIS_URL);

export const REDIS_PUBLISHER = new Redis(REDIS_URL);