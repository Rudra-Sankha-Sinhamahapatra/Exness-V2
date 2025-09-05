import { WebSocketServer } from "ws";

export function startWsMockserver(port = 8089) {
    const wss = new WebSocketServer({ port });
    wss.on("connection", (ws) => {
        const timer = setInterval(() => {
            const msg = {
                data:{
                e: "bookTicker",
                s: "BTC_USDC",
                a: (1000 + Math.random() * 100).toFixed(2),
            },
         };
         ws.send(JSON.stringify(msg));
     },200);

     ws.on('close', () => clearInterval(timer));
});
 return wss;
}