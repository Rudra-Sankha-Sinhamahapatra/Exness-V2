import type { Request, Response } from "express";
import { redis, REDIS_SUB, TRADE_QUEUE } from "../redis";
import { v4 as uuidv4 } from "uuid";

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
        const responseId = uuidv4();
        const responseChannel = `trade_response_${responseId}`;
        const orderId = uuidv4();
        const QUEUE_CHANNEL = "trade_stream";
        const QUEUE_EVENT = "CREATE_TRADE";


        await REDIS_SUB.subscribe(responseChannel);

        await TRADE_QUEUE.lpush(QUEUE_CHANNEL, JSON.stringify({
            email,
            event: QUEUE_EVENT,
            responseChannel,
            orderId,
            ...tradeData
        }));

        const tradePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                REDIS_SUB.unsubscribe(responseChannel);
                reject(new Error("Trade request timed out"));
            }, 10000);

            REDIS_SUB.once('message', (channel, message) => {
                if (channel === responseChannel) {
                    clearTimeout(timeout);
                    REDIS_SUB.unsubscribe(responseChannel);
                    resolve(JSON.parse(message));
                }
            });
        });

        const response = await tradePromise as TradeResponse;

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


        await REDIS_SUB.subscribe(responseChannel);

        await TRADE_QUEUE.lpush(QUEUE_CHANNEL, JSON.stringify({
            email,
            event: QUEUE_EVENT,
            responseChannel,
            orderId
        }));

        const tradePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                REDIS_SUB.unsubscribe(responseChannel);
                reject(new Error("Trade close request timed out"));
            }, 10000);

            REDIS_SUB.once('message', (channel, message) => {
                if (channel === responseChannel) {
                    clearTimeout(timeout);
                    REDIS_SUB.unsubscribe(responseChannel);
                    resolve(JSON.parse(message));
                }
            });
        });

        const response = await tradePromise as TradeResponse;

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