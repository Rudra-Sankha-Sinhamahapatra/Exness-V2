import { redis } from "./redis";
import { latestAssetPrices } from "./store/assetPrice";
import { listenUserWallet } from "./watcher/balanceWatcher";
import { listenTrades } from "./watcher/tradesWatcher";

interface assetUpdate {
  asset: string;
  price: bigint;
  decimals: number
}

(async () => {
  const channel = 'price_channel';
  console.log(`Subscribing to price_channel ${channel}`);
  await redis.subscribe(channel);
  console.log("Subscribed to the channel: ", channel);

  redis.on('message', (chan: string, message: string) => {
    if (chan !== channel) return;
    try {
      const data = JSON.parse(message);
      if (data.price_updates && Array.isArray(data.price_updates)) {
        data.price_updates.forEach((update: assetUpdate) => {
          latestAssetPrices[update.asset as keyof typeof latestAssetPrices] = {
            price: update.price,
            decimals: update.decimals
          };
          // console.log(`Updated ${update.asset}: `,
          //   (latestAssetPrices[update.asset as keyof typeof latestAssetPrices])
          // );
        });
      }
    } catch (error) {
      console.error('Failed to parse price update:', error);
    }
  });

  listenUserWallet().catch(error => {
    console.error("Error processing user wallet balance:", error);
  });

  listenTrades().catch(error => {
  console.error("Error in trade watcher:",error);
  });

      console.log("All listeners started");
})()

