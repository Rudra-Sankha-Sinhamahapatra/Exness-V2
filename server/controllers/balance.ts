import { REDIS_PUSH_QUEUE } from "../redis";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { waitForResponse } from "../utils/waitForResponse";


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
            res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            });
            return
        }

        const walletChannel = "user_wallet_stream";
        const event = "GET_USER_BALANCE";

        const responseId = uuidv4();
        const responseChannel = `balance_response_${responseId}`;

        await REDIS_PUSH_QUEUE.lpush(walletChannel, JSON.stringify({
            email,
            "event": event,
            responseChannel
        }));

        const response = await waitForResponse(responseChannel) as BalanceResponse;

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
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            });
        }

        const walletChannel = "user_wallet_stream";
        const event = "GET_USDC_BALANCE";
        const responseId = uuidv4();
        const responseChannel = `balance_response_${responseId}`;

        await REDIS_PUSH_QUEUE.lpush(walletChannel, JSON.stringify({
            email,
            event,
            responseChannel
        }));

        const response = await waitForResponse(responseChannel) as BalanceResponse;

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
