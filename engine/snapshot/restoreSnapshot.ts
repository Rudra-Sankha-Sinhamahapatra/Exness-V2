import { pool } from "@exness/snapshotdb";
import { userBalances } from "../store/balance";
import { trades } from "../store/trade";

function restoreBigInt(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((v) => restoreBigInt(v));
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, restoreBigInt(v)])
    );
  } else if (typeof obj === "string" && /^\d+$/.test(obj)) {
    return BigInt(obj);
  }
  return obj;
}

export async function restoreSnapshot() {
  try {
    const result = await pool.query(
      `SELECT id,
       open_orders AS "openOrders",
       closed_orders AS "closedOrders",
        balances
        FROM snapshots 
        ORDER BY created_at DESC 
        LIMIT 1
        `
    );

    if (result.rows.length === 0) {
      console.log("No snapshot found, starting fresh.");
      return { offsetId: 0n };
    }

    const snapshot = result.rows[0] as {
      id: string;
      openOrders: any [];
      closedOrders: any[];
      balances: any[]
    };

      if (snapshot.openOrders) {
      snapshot.openOrders.forEach((t) => {
        trades.set(t.orderId, restoreBigInt(t) as any);
      });
    }

    if (snapshot.closedOrders) {
      snapshot.closedOrders.forEach((t) => {
        trades.set(t.orderId, restoreBigInt(t) as any);
      });
    }


      if (snapshot.balances) {
      snapshot.balances.forEach((b) => {
        userBalances.set(b.email, restoreBigInt(b) as any);
      });
    }

    console.log(
      "Restored snapshot ",
      "trades:",
      trades.size,
      "balances:",
      userBalances.size
    );

    return { snapshot: snapshot.id };
  } catch (error) {
    console.error("Failed to restore snapshot: ", error);
  }
}