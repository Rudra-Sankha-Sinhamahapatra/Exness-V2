import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis }from "../redis";

export const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rlflx",
    points: 80,         
    duration: 60,       
    blockDuration: 40, 
})
