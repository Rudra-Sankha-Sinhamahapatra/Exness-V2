import { redis } from "../redis";
import { userBalances } from "../store/balance";
import { trades } from "../store/trade";

function serializeBigInt(obj: any) {
    return JSON.parse(
        JSON.stringify(obj, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

const snapshotQueue =  "snapshot_queue";

export async function queueSnapshot() {
    try {
        const openTrades = Array.from(trades.values()).filter(
            (t) => t.status === 'open'
        );

        const closedTrades = Array.from(trades.values()).filter(
            (t) => t.status === 'closed'
        )

        const balances = Array.from(userBalances.values());

         const snapshotData = {
          openTrades: serializeBigInt(openTrades),
          closedTrades: serializeBigInt(closedTrades),
          balances: serializeBigInt(balances)
         };

         await redis.xadd(
        snapshotQueue,
        '*',
        'data', JSON.stringify(snapshotData)
         )
         

        // console.log("Snapshot saved:", snapshot.id);
        console.log(`Snapshot queued at ${new Date().toISOString()}`);

    } catch (error) {
        console.error("Failed to take snapshot: ", error);
    }
}