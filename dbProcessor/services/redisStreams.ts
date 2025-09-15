import { GROUP, OPERATIONS_STREAM, redis, SNAPSHOT_STREAM } from "../redis";

export async function ensureGroup() {
  try {
    await redis.xgroup("CREATE", OPERATIONS_STREAM, GROUP, "$", "MKSTREAM");
  } catch (e: any) {
    if (!String(e?.message || e).includes("BUSYGROUP")) throw e;
  }

  try {
    await redis.xgroup("CREATE", SNAPSHOT_STREAM, GROUP, "$", "MKSTREAM");
  } catch (e: any) {
    if (!String(e?.message || e).includes("BUSYGROUP")) throw e;
  }
}
