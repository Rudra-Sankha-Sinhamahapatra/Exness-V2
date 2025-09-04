
import { Processor } from "../processor/processor";
import { REDIS_WALLET_RECEIVE_QUEUE } from "../redis";

export async function listenUserWallet() {
    const CHANNEL = "user_wallet_stream";

     console.log("Started wallet listener on channel:", CHANNEL);
    while (true) {
        try {
            const response = await REDIS_WALLET_RECEIVE_QUEUE.brpop(CHANNEL, 0);
            //  console.log("response: ",response)
            if (response) {
                const [channel, data] = response;
                console.log("Received wallet request: ",data);
                const parsedData = JSON.parse(data);

                console.log('response: ',response)
                 console.log("Processing wallet event:", parsedData.event);

                  const result = await Processor(parsedData.event, parsedData);
                 console.log(`Processed wallet for ${parsedData.email}:`, result);
            }
        } catch (error) {
            console.error("Error processing wallet stream:", error);
            await new Promise(resolve => setTimeout(resolve,1000));
        }
    }
}