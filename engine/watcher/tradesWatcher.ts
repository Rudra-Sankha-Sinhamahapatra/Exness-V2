
import { isShuttingDown } from "..";
import { Processor } from "../processor/processor";
import { REDIS_TRADE_RECEIVE_QUEUE } from "../redis";

export async function listenTrades() {

    const CHANNEL = "trade_stream";

    console.log("Started trades listener on channel:", CHANNEL);
    while (!isShuttingDown) {
        try {
            const response = await REDIS_TRADE_RECEIVE_QUEUE.brpop(CHANNEL, 0);

            if (response) {
                const [channel, data] = response;
                console.log("Received trade request:", data);

                const parsedData = JSON.parse(data);
                console.log("Processing trade:", parsedData.event);

                const result = await Processor(parsedData.event, parsedData);
                console.log(`Processed trade for ${parsedData.email}:`, result);
            }
        } catch (error) {
            if (!isShuttingDown) {
                console.error("Error processing trade stream:", error);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
}