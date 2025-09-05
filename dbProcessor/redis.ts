import Redis from "ioredis";
import { REDIS_URL } from "./config";

export const redis = new Redis(REDIS_URL);

export const STREAM = "snapshot_queue";
export const GROUP = "snapshot_processor_group";
export const CONSUMER = "snapshot_processor_1";