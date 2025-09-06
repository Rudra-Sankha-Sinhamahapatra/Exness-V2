import { initDB, pool } from "@exness/snapshotdb";
import { redis } from "./redis";
import { restoreSnapshot } from "./snapshot/restoreSnapshot";
import { queueSnapshot } from "./snapshot/queueSnapshot";
import { latestAssetPrices, type Asset } from "./store/assetPrice";
import { listenUserWallet } from "./watcher/balanceWatcher";
import { listenTrades } from "./watcher/tradesWatcher";
import { prisma } from "@exness/db";
import { checkLiquidations } from "./services/checkLiquidation";

interface assetUpdate {
  asset: string;
  price: bigint;
  decimals: number
}

type StreamFieldList = string[]; // ["data", "{...}", "k2", "v2", ...]
type StreamEntry = [id: string, fields: StreamFieldList];
type StreamRead = Array<[stream: string, entries: StreamEntry[]]>;

const STREAM = "price_stream";
const GROUP = "engine_group";
const CONSUMER = "engine_1";

export let isShuttingDown = false;
let shutdownInProgress = false;

async function ensureGroup() {
  try {
    await redis.xgroup("CREATE", STREAM, GROUP, "$", "MKSTREAM");
  } catch (e: any) {
    if (!String(e?.message || e).includes("BUSYGROUP")) throw e;
  }
}

function fieldsToObject(fields: StreamFieldList): Record<string, string> {
  const obj: Record<string, string> = {};
  for (let i = 0; i + 1 < fields.length; i += 2) {
    const k = fields[i];
    const v = fields[i + 1] ?? "";
    if (typeof k === "string") obj[k] = v;
  }
  return obj;
}

async function startPriceListener() {
  await ensureGroup();

  while (!isShuttingDown) {
    const res = (await redis.xreadgroup(
      "GROUP", GROUP, CONSUMER,
      "COUNT", 100,
      "BLOCK", 0,
      "STREAMS", STREAM,
      ">"
    )) as StreamRead | null;

    if (!res) continue;

    for (const [, entries] of res) {
      for (const [id, fields] of entries) {
        try {
          const kv = fieldsToObject(fields);
          const payload = kv["data"] ?? "{}";
          const msg = JSON.parse(payload);

          if (Array.isArray(msg.price_updates)) {
            for (const u of msg.price_updates as Array<assetUpdate>) {
              latestAssetPrices[u.asset as keyof typeof latestAssetPrices] = {
                price: BigInt(u.price),
                decimals: u.decimals,
              };
              // console.log("u: ", u);
              await redis.set(`price-${u.asset}`, JSON.stringify({
                price: u.price,
                timestamp: Date.now()
              }), 'EX', 30);
              // console.log("price updated");
              // console.log(latestAssetPrices)

              checkLiquidations(u.asset as Asset, BigInt(u.price))
            }
          }

          await redis.xack(STREAM, GROUP, id);
        } catch (err) {
          console.error("Failed to parse price entry:", err);
          await redis.xack(STREAM, GROUP, id);
        }
      }
    }
  }
}


let snapshotInterval: NodeJS.Timeout;

async function main() {
  try {
    await initDB();
    await restoreSnapshot();
    console.log("Restored snapshot");

    Promise.all([
      startPriceListener(),
      listenUserWallet(),
      listenTrades()
    ]).catch(error => {
      console.error("Error in listeners:", error);
      process.exit(1);
    })

    console.log("All listeners started");

    if (snapshotInterval) {
      clearInterval(snapshotInterval);
    }

    snapshotInterval = setInterval(async () => {
      await queueSnapshot();
    }, 10000);

  } catch (error) {
    console.error("Failed to start engine:", error);
    await redis.quit();
    await pool.end();

    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  if (shutdownInProgress) {
    console.log('Forced shutdown...');
    process.exit(1);
  }

  console.log('Shutting down...');
  try {
    isShuttingDown = true;
    shutdownInProgress = true;

    if (snapshotInterval) {
      clearInterval(snapshotInterval);
    }

    await Promise.all([
      redis.quit(),
      pool.end(),
      prisma.$disconnect
    ]);

    console.log('Connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Shutdown error:', error);
    process.exit(1);
  }
});

main();

