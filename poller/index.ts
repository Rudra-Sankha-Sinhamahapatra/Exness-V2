import WebSocket from "ws";
import { assets, WS_URL } from "./config";
import { decimals, latestPrices } from "./store";
import { redis } from "./redis";

const ws = new WebSocket(WS_URL);

let Id = 1;

ws.on('open', () => {
    console.log("Connected to backpack WS");

    assets.forEach((asset) => {
        const subscribeMessages = [
            {
                method: "SUBSCRIBE",
                params: [`bookTicker.${asset}`],
                id: Id++,
            },
            {
                method: "SUBSCRIBE",
                params: [`depth.200ms.${asset}`],
                id: Id++
            },

            {
                method: "SUBSCRIBE",
                params: [`trade.${asset}`],
                id: Id++
            }

        ];

        subscribeMessages.forEach((msg) => {
            ws.send(JSON.stringify(msg));
            // console.log("Sent:", msg);
        });

        console.log("Subscribed to asset: ", asset);
    });
});

ws.on("message", (msg) => {
    try {
        const parsedMsg = JSON.parse(msg.toString());

        if (parsedMsg?.data?.e === 'bookTicker') {
            const symbol = parsedMsg.data.s;
            const price = parseFloat(parsedMsg.data.a);

            latestPrices[symbol] = {
                price,
                decimal: decimals[symbol]!
            }
        }
    } catch (error) {
        console.log("Ws parsing error: ", error);
    }
});

ws.on("error", (err) => {
    console.error("WS error:", err);
});

ws.on("close", (code, reason) => {
    console.error("WS closed:", code, reason.toString());
});

setInterval(async() => {
    // logs.txt
    // if (Object.keys(latestPrices).length > 0) {
    //     console.log("Latest prices: ",latestPrices);
    // }

    const updates = Object.entries(latestPrices).map(([symbolName, data]) => ({
        asset: symbolName.split("_")[0],
        price: Math.round(data.price * 10** data.decimal),
        decimals: data.decimal
    }));

    // console.log(updates)
    if (updates.length > 0) {
        const payload = { price_updates: updates };
        // console.log("payload: ",payload)
       await redis.xadd('price_stream', 'MAXLEN', '~', '10000', '*', 'data', JSON.stringify(payload))
        // console.log("Published: ", payload);
    }
}, 100)