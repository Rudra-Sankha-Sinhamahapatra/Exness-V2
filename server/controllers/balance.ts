import { redis } from "../redis";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";


interface BalanceResponse {
  success: boolean;
  data: {
    email: string;
    btc: { balance: bigint; decimals: number };
    eth: { balance: bigint; decimals: number };
    sol: { balance: bigint; decimals: number };
    usdc: { balance: bigint; decimals: number };
  };
  error: string
}

export const getUserBalance = async (req: Request, res: Response) => {
    try {
        const email = req.user.email;
        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email not found"
            });
            return
        }

        const walletChannel = "user_wallet_stream";
        const event = "GET_USER_BALANCE";

        const responseId = uuidv4();
        const responseChannel = `balance_response_${responseId}`;

        await redis.lpush(walletChannel, JSON.stringify({
            email,
            "event": event,
            responseChannel
        }));

        await redis.subscribe(responseChannel);

        const balancePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                redis.unsubscribe(responseChannel);
                reject(new Error("Balance request timed out"));
            }, 10000);

            redis.once('message', (channel, message) => {
                if (channel === responseChannel) {
                    clearTimeout(timeout);
                    redis.unsubscribe(responseChannel);
                    resolve(JSON.parse(message));
                }
            });
        });

        const response = await balancePromise as BalanceResponse;
        
        const formattedBalance = {
              USDC: {
                balance: Number(response.data.usdc.balance),
                decimals: response.data.usdc.decimals
            },
            BTC: {
                balance: Number(response.data.btc.balance),
                decimals: response.data.btc.decimals
            },
            ETH: {
                balance: Number(response.data.eth.balance),
                decimals: response.data.eth.decimals
            },
            SOL: {
                balance: Number(response.data.sol.balance),
                decimals: response.data.sol.decimals
            }
        };

        return res.status(200).json(formattedBalance);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        });
        return;
    }
}

export const getUsdcBalance = async (req: Request, res: Response) => {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not found"
            });
        }

        const walletChannel = "user_wallet_stream";
        const event = "GET_USDC_BALANCE";
        const responseId = uuidv4();
        const responseChannel = `balance_response_${responseId}`;

        await redis.lpush(walletChannel, JSON.stringify({
            email,
            event,
            responseChannel
        }));


        await redis.subscribe(responseChannel);

        const balancePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                redis.unsubscribe(responseChannel);
                reject(new Error("Balance request timed out"));
            }, 10000);

            redis.once('message', (channel, message) => {
                if (channel === responseChannel) {
                    clearTimeout(timeout);
                    redis.unsubscribe(responseChannel);
                    resolve(JSON.parse(message));
                }
            });
        });

        const response = await balancePromise as BalanceResponse;
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to get balance');
        }

        return res.status(200).json({
            balance: Number(response.data.usdc.balance)
        });
    } catch (error) {
        console.error('Error in getUsdcBalance:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server error"
        });
    }
}
