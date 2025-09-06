import { redis } from "../redis"

const QUEUE_NAME = "db_operations_queue";

export async function queueDBOperation(operation: string, data: any) {
    try {
        await redis.xadd(
        QUEUE_NAME,
        '*',
        'operation', operation,
        "data", JSON.stringify(data)
        )
    } catch (error) {
        console.error("Failed to queue DB operation:",error);
    }
}
