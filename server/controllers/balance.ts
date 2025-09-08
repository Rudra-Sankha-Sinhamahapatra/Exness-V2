import { REDIS_PUSH_QUEUE } from "../redis";
import { v4 as uuidv4 } from "uuid";
import { waitForResponse } from "../utils/waitForResponse";
import { jsonResponse } from "../utils/jsonResponse"

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

export const getUserBalance = async (req: Request): Promise<Response> => {
    try {
         const email = (req as any).user?.email;
      if (!email) {
            return jsonResponse({ success: false, message: "Unauthorized Access" }, 401);
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

        return jsonResponse(formattedBalance);
    } catch (error) {
    return jsonResponse({ success: false, message: "Internal Server error" }, 500);
    }
}

export const getUsdcBalance = async (req: Request): Promise<Response> => {
    try {
        const email = (req as any).user?.email;
          if (!email) {
            return jsonResponse({ success: false, message: "Unauthorized Access" }, 401);
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

       return jsonResponse({ balance: Number(response.data.usdc.balance) });
    } catch (error) {
         console.error('Error in getUsdcBalance:', error);
          return jsonResponse({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server error"
        }, 500);
    }
}
