import { REDIS_RECEIVE_QUEUE } from "../redis";

export async function waitForResponse(
  responseChannel: string,
  timeoutMs = 10_000
): Promise<unknown> {
  const timeoutSecs = Math.ceil(timeoutMs / 1000);

  const res = await REDIS_RECEIVE_QUEUE.brpop(responseChannel, timeoutSecs);
  if (!res) {
    throw new Error("Request timed out");
  }

  const [, payload] = res;
  return JSON.parse(payload);
}
