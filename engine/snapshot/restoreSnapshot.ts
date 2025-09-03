import { db } from "../db";
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
  const snapshot = await db.snapshot.findFirst({
    select: {id: true,openOrders: true, closedOrders: true, balances: true},
    orderBy: { createdAt: "desc" },
  });

  if (!snapshot) {
    console.log("No snapshot found, starting fresh.");
    return { offsetId: 0n };
  }

  (snapshot.openOrders as any[]).forEach((t) => {
    trades.set(t.orderId, restoreBigInt(t) as any);
  });

    (snapshot.closedOrders as any[]).forEach((t) => {
    trades.set(t.orderId, restoreBigInt(t) as any);
  });


  (snapshot.balances as any[]).forEach((b) => {
    userBalances.set(b.email, restoreBigInt(b) as any);
  });

  console.log(
    "Restored snapshot with offset:",
    "trades:",
    trades.size,
    "balances:",
    userBalances.size
  );

  return { snapshot: snapshot.id };
}