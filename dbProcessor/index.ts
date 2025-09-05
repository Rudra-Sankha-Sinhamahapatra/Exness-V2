import { initDB, pool } from "@exness/snapshotdb";
import { CONSUMER,GROUP, redis, STREAM } from "./redis";
import { ensureGroup, takeSnapshot } from "./snapshot/takeSnapshot";

let isShuttingDown = false;

async function startSnapshotProcessor() {
    await ensureGroup();

    while(!isShuttingDown) {
        try {
            const res = await redis.xreadgroup(
                'GROUP', GROUP, CONSUMER,
                'COUNT', 10,
                'BLOCK', 100,
                'STREAMS', STREAM,
                '>'
            )as any;

            if(!res) continue;


            for(const [,entries] of res) {
              for(const [id,fields] of entries) {
                try {
                    const data = JSON.parse(fields[1]);
                    await takeSnapshot(data);
                    await redis.xack(STREAM,GROUP,id);
                } catch (error) {
                     console.error("Failed to process snapshot entry:", error);
                     await redis.xack(STREAM, GROUP, id);
                }
              }
            }

        } catch (error) {
            console.error("Error in snapshot processor:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function main() {
    try {
            await initDB();
        console.log("Starting snapshot processor...");
        await startSnapshotProcessor();
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
            pool.end()
        ]);
        console.log('Snapshot processor connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Snapshot processor shutdown error:', error);
        process.exit(1);
    }
});

main();