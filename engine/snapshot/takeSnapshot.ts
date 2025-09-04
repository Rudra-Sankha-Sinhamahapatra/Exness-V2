import { pool } from "../database";
import { userBalances } from "../store/balance";
import { trades } from "../store/trade";
import { v4 as uuidv4 } from "uuid";

function serializeBigInt(obj: any) {
    return JSON.parse(
        JSON.stringify(obj, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

export async function takeSnapshot() {
    try {
        const openTrades = Array.from(trades.values()).filter(
            (t) => t.status === 'open'
        );

        const closedTrades = Array.from(trades.values()).filter(
            (t) => t.status === 'closed'
        )

        const balances = Array.from(userBalances.values());
         const snapshotId = uuidv4();

                await pool.query(
            `INSERT INTO snapshots (id, open_orders, closed_orders, balances) 
             VALUES ($1, $2, $3, $4)`,
            [
                snapshotId,
                JSON.stringify(serializeBigInt(openTrades)),
                JSON.stringify(serializeBigInt(closedTrades)),
                JSON.stringify(serializeBigInt(balances))
            ]
        );

        // console.log("Snapshot saved:", snapshot.id);
        return { id: snapshotId };

    } catch (error) {
        console.error("Failed to take snapshot: ", error);
    }
}