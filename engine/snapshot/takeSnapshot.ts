import { db } from "../db";
import { userBalances } from "../store/balance";
import { trades } from "../store/trade";

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

        const snapshot = await db.snapshot.create({
            data: {
                openOrders: serializeBigInt(openTrades),
                closedOrders: serializeBigInt(closedTrades),
                balances: serializeBigInt(balances),
            }
        })

        // console.log("Snapshot saved:", snapshot.id);
        return snapshot;

    } catch (error) {
        console.error("Failed to take snapshot: ", error);
    }
}