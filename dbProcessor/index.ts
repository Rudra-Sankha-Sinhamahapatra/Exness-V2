import { initDB, pool } from "@exness/snapshotdb";
import { CONSUMER,GROUP, OPERATIONS_STREAM, redis, SNAPSHOT_STREAM } from "./redis";
import { takeSnapshot } from "./snapshot/takeSnapshot";
import { ensureGroup } from "./services/redisStreams";
import { processDBOperation } from "./services/processDB";
import { prisma }from "@exness/db"

let isShuttingDown = false;

async function startDBProcessor() {
await ensureGroup();    
while(!isShuttingDown) {
    try {
        const res = await redis.xreadgroup(
            "GROUP",GROUP,CONSUMER,
            "COUNT", 60,
            "BLOCK", 600,
            "STREAMS",
            OPERATIONS_STREAM, SNAPSHOT_STREAM,
            ">", ">"
        ) as any;

        if(!res) continue;

        for (const [stream,entries] of res) {
            for (const [id, fields] of entries) {
                try {
                    if(stream === OPERATIONS_STREAM) {
                        const operation = fields[1];
                        const data = JSON.parse(fields[3]);
                        await processDBOperation(operation,data);
                    } else if (stream === SNAPSHOT_STREAM) {
                        const data = JSON.parse(fields[1]);
                        await takeSnapshot(data)
                    }

                    await redis.xack(stream,GROUP,id);
                } catch (error) {
                      console.error(`Failed to process ${stream} entry:`, error);
                      await redis.xack(stream, GROUP, id);
                }
            }
        }
    } catch (error) {
        console.error("Error in DB processor:", error);
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
}

async function main() {
    try {
        await initDB();
        console.log("Starting snapshot processor...");
        await startDBProcessor();
    } catch (error) {
        console.error("Failed to start snapshot processor:", error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('Shutting down snapshot processor...');
    try {
        isShuttingDown = true;
        await Promise.all([
            redis.quit(),
            pool.end(),
            prisma.$disconnect
        ]);
        console.log('Snapshot processor connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Snapshot processor shutdown error:', error);
        process.exit(1);
    }
});

main();