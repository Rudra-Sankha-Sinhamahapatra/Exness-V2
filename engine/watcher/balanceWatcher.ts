import { REDIS_QUEUE } from "../redis";
import { Processor } from "../processor/processor";

export async function listenUserWallet() {
    while (true) {
        try {
            const CHANNEL = "user_wallet_stream";
            const response = await REDIS_QUEUE.brpop(CHANNEL, 0);

            if (response) {
                const [channel, data] = response;
                const { email, event, responseChannel } = JSON.parse(data);

                // console.log('response: ',response)
                // console.log("event", event)

                const result = await Processor(event, { email, responseChannel });
                console.log(`Processed wallet for ${email}:`, result);
            }
        } catch (error) {
            console.error("Error processing wallet stream:", error);
        }
    }
}