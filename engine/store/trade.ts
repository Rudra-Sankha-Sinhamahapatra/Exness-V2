import type { Asset } from "./assetPrice";

export interface Trade {
    orderId: string;
    email: string;
    asset: Asset;
    type: 'long' | 'short';
    margin: bigint;
    leverage: number;
    slippage: number;
    entryPrice: bigint;
    status: 'open' | 'closed';
    timestamp: number;
}

export const trades = new Map<string, Trade>();

export function createTrade(trade: Trade) {
    trades.set(trade.orderId, trade);
    return trade;
}

export function getTrade(orderId: string) {
    return trades.get(orderId);
}

export function closeTrade(orderId: string) {
    const trade = trades.get(orderId);
    if (trade) {
        trade.status = 'closed';
        trades.set(orderId, trade);
    }
    return trade;
}