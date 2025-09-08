import { redis, REDIS_PUSH_QUEUE } from "../redis";
import { v4 as uuidv4 } from "uuid";
import { waitForResponse } from "../utils/waitForResponse";
import { jsonResponse } from "../utils/jsonResponse";

export type Asset = 'SOL' | 'ETH' | 'BTC';

interface CreateTradeRequest {
    asset: Asset;
    type: 'long' | 'short';
    margin: number;
    leverage: number;
    slippage: number;
}

interface TradeResponse {
    success: boolean;
    data?: {
        orderId: string;
    };
    error?: string;
}


export const createTrade = async (req: Request): Promise<Response> => {
    try {
          const email = (req as any).user?.email;
        if (!email) {
            return jsonResponse({
                success: false,
                message: "Unauthorized Access"
            }, 401);
        }

         const tradeData: CreateTradeRequest = await req.json() as CreateTradeRequest;

  if(tradeData.margin <= 99) {
            return jsonResponse({
                success: false,
                message: "Margin must be greater than 0.99"
            }, 400);
        }

         if(!['SOL', 'ETH', 'BTC'].includes(tradeData.asset)) {
            return jsonResponse({
                success: false,
                message: "Invalid asset. Supported assets are SOL, ETH, BTC"
            }, 400);
        }

        if(!['long', 'short'].includes(tradeData.type)) {
            return jsonResponse({
                success: false,
                message: "Invalid trade type. Supported types are long and short"
            }, 400);
        }

        if(tradeData.leverage < 1 || tradeData.leverage > 100) {
            return jsonResponse({
                success: false,
                message: "Leverage must be between 1 and 100"
            }, 400);
        }

           if(tradeData.slippage > 10000 || tradeData.slippage < 10) {
            return jsonResponse({
                success: false,
                message: "Slippage value should be between 0.1 to 100 %"
            }, 400);
        }

      const currentPrice =  await redis.get(`price-${tradeData.asset}`);

      console.log("Current server price: ", currentPrice);

           if (!currentPrice) {
            return jsonResponse({
                success: false,
                message: "Current price not available for the selected asset"
            }, 400);
        }

        const tradeTimeVal = JSON.parse(currentPrice);

        const responseId = uuidv4();
        const responseChannel = `trade_response_${responseId}`;
        const orderId = uuidv4();
        const QUEUE_CHANNEL = "trade_stream";
        const QUEUE_EVENT = "CREATE_TRADE";

        await REDIS_PUSH_QUEUE.lpush(QUEUE_CHANNEL, JSON.stringify({
            email,
            currentPrice:  tradeTimeVal.price,
            event: QUEUE_EVENT,
            responseChannel,
            orderId,
            ...tradeData
        }));

        const response = await waitForResponse(responseChannel) as TradeResponse;

        if (!response.success) {
            throw new Error(response.error || "Trade failed");
        }

      return jsonResponse({ orderId });
    } catch (error) {
     console.error("Trade error:", error);
        return jsonResponse({
            error: error instanceof Error ? error.message : "Internal server error"
        }, 500);
    }
}


export const closeTrade = async (req: Request): Promise<Response> => {
    try {
        const email = (req as any).user?.email;
        if (!email) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const { orderId } = await req.json() as { orderId: string};
        if (!orderId) {
            return jsonResponse({ message: "Order Id is required" }, 400);
        }

        const responseId = uuidv4();
        const responseChannel = `trade_response_${responseId}`;
        const QUEUE_EVENT = 'CLOSE_TRADE';
        const QUEUE_CHANNEL = 'trade_stream';

        await REDIS_PUSH_QUEUE.lpush(QUEUE_CHANNEL, JSON.stringify({
            email,
            event: QUEUE_EVENT,
            responseChannel,
            orderId
        }));

        const response = await waitForResponse(responseChannel) as TradeResponse;

        if (!response.success) {
            throw new Error(response.error || "Failed to close trade");
        }

   return jsonResponse({ orderId });

    } catch (error) {
           console.error("Trade close error:", error);
        return jsonResponse({
            error: error instanceof Error ? error.message : "Internal server error"
        }, 500);
    }
}