import { TRADE_QUEUE } from "../redis";
import { Processor } from "../processor/processor";

export async function listenTrades() {
    while (true) {
        try {
            const CHANNEL = "trade_stream";
            const response = await TRADE_QUEUE.brpop(CHANNEL, 0);

            if (response) {
                const [channel, data] = response;
                console.log("Received trade request:", data);
                
                const parsedData = JSON.parse(data);
                console.log("Processing trade:", parsedData.event);

                const result = await Processor(parsedData.event, parsedData);
                console.log(`Processed trade for ${parsedData.email}:`, result);
            }
        } catch (error) {
            console.error("Error processing trade stream:", error);
        }
    }
}