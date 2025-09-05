import { pool } from "@exness/snapshotdb";
import { v4 as uuidv4 } from "uuid";
import { GROUP, redis, STREAM } from "../redis";

export async function ensureGroup() {
 try {
    await redis.xgroup("CREATE",STREAM,GROUP,'$','MKSTREAM');
 } catch (e:any) {
    if (!String(e?.message || e).includes("BUSYGROUP")) throw e;
 }
}

export async function takeSnapshot(data:any) {
    try {
         const snapshotId = uuidv4();

                await pool.query(
            `INSERT INTO snapshots (id, open_orders, closed_orders, balances) 
             VALUES ($1, $2, $3, $4)`,
            [
                snapshotId,
                JSON.stringify(data.openTrades),
                JSON.stringify(data.closedTrades),
                JSON.stringify(data.balances)
            ]
        );

        // console.log("Snapshot saved:", snapshot.id);
        console.log(`Snapshot saved: ${snapshotId} at ${new Date().toISOString()}`);
        return { id: snapshotId };

    } catch (error) {
        console.error("Failed to take snapshot: ", error);
          throw error;
    }
}