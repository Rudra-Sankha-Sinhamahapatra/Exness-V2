import type { Request, Response } from "express";
import { redis, REDIS_PUSH_QUEUE } from "../redis";
import { v4 as uuidv4 } from "uuid";
import { waitForResponse } from "../utils/waitForResponse";

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


export const createTrade = async (req: Request, res: Response) => {
    try {
        const email = req.user.email;
        if (!email) {
            res.status(401).json({
                sucess: false,
                message: "Unauthorized Access"
            })
        }

        const tradeData: CreateTradeRequest = req.body;
        if(tradeData.margin<=99) {
            res.status(400).json({
                success: false,
                message: "Margin must be greater than 0.99"
            })
            return;
        }

        if(!['SOL', 'ETH', 'BTC'].includes(tradeData.asset)) {
            res.status(400).json({
                success: false,
                message: "Invalid asset. Supported assets are SOL, ETH, BTC"
            })
            return;
        }

        if(!['long', 'short'].includes(tradeData.type)) {
            res.status(400).json({
                success: false,
                message: "Invalid trade type. Supported types are long and short"
            })
            return;
        }

        if(tradeData.leverage<1 || tradeData.leverage>100) {
            res.status(400).json({
                success: false,
                message: "Leverage must be between 1 and 100"
            })
            return;
        }

        if(tradeData.slippage>10000 || tradeData.slippage < 10) {
                res.status(400).json({
                success: false,
                message: "Slippage value should be between 0.1 to 100 %"
            })
            return;
        }

      const currentPrice =  await redis.get(`price-${tradeData.asset}`);

      console.log("Current server price: ", currentPrice);
        if (!currentPrice) {
            res.status(400).json({
                success: false,
                message: "Current price not available for the selected asset"
            });
            return;
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

        res.status(200).json({ orderId });
        return;
    } catch (error) {
        console.error("Trade error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error"
        });
        return;
    }
}


export const closeTrade = async (req: Request, res: Response) => {
    try {
        const email = req.user.email;
        if (!email) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { orderId } = req.body;
        if (!orderId) {
            res.status(400).json({ message: "Order Id is required " });
            return;
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

        res.status(200).json({
            orderId
        })

        return;

    } catch (error) {
        console.error("Trade close error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
}