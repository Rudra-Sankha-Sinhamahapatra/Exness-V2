import { redis, REDIS_PUSH_QUEUE } from "../redis";
import { v4 as uuidv4 } from "uuid";
import { waitForResponse } from "../utils/waitForResponse";
import { jsonResponse } from "../utils/jsonResponse";
import { prisma } from "@exness/db";

/**
 * Calculate the duration between two dates in a human-readable format
 */
function calculateDuration(startDate: Date, endDate: Date): string {
    const durationMs = endDate.getTime() - startDate.getTime();
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
        return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) {
        return `${hours}h ${remainingMinutes}m`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
}


function calculatePnlPercentage(trade: any): number | null {
    if (trade.pnl === null || trade.closePrice === null) {
        return null;
    }
    
    const initialMargin = parseFloat(trade.openPrice) / parseFloat(trade.leverage);
    if (initialMargin === 0) {
        return 0;
    }
    
    return (parseFloat(trade.pnl) / initialMargin) * 100;
}

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

export const getTradeHistory = async (req: Request): Promise<Response> => {
    try {
        const email = (req as any).user?.email;
        if (!email) {
            return jsonResponse({
                success: false,
                message: "Unauthorized Access"
            }, 401);
        }

        const url = new URL(req.url);
        
        const status = url.searchParams.get('status');
        const asset = url.searchParams.get('asset');
        const tradeType = url.searchParams.get('tradeType'); 
        const profitable = url.searchParams.get('profitable'); 
        const liquidated = url.searchParams.get('liquidated');
        const fromDate = url.searchParams.get('fromDate');
        const toDate = url.searchParams.get('toDate');
        
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';

        const whereClause: any = {
            user: {
                email: email
            }
        };

        if (status === 'open') {
            whereClause.closePrice = null;
        } else if (status === 'closed') {
            whereClause.closePrice = { not: null };
        }

        if (asset) {
            whereClause.asset = {
                symbol: asset
            };
        }

        if (tradeType) {
            whereClause.tradeType = tradeType;
        }

        if (profitable === 'true') {
            whereClause.pnl = { gt: 0 };
        } else if (profitable === 'false') {
            whereClause.pnl = { lte: 0 };
        }

        if (liquidated === 'true') {
            whereClause.liquidated = true;
        } else if (liquidated === 'false') {
            whereClause.liquidated = false;
        }

        if (fromDate) {
            whereClause.createdAt = {
                ...(whereClause.createdAt || {}),
                gte: new Date(fromDate)
            };
        }
        
        if (toDate) {
            whereClause.createdAt = {
                ...(whereClause.createdAt || {}),
                lte: new Date(toDate)
            };
        }

        const totalCount = await prisma.existingTrade.count({
            where: whereClause
        });

        const tradeData = await prisma.existingTrade.findMany({
            where: whereClause,
            include: {
                asset: {
                    select: {
                        symbol: true,
                        name: true,
                        imageUrl: true
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc'
            },
            take: limit,
            skip: offset
        });

        if (!tradeData.length) {
            return jsonResponse({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    limit,
                    offset,
                    hasMore: false
                }
            });
        }

        const formattedTrades = tradeData.map(trade => ({
            id: trade.id,
            orderId: trade.orderId,
            asset: trade.asset.symbol,
            assetName: trade.asset.name,
            assetImage: trade.asset.imageUrl,
            openPrice: trade.openPrice,
            closePrice: trade.closePrice,
            leverage: trade.leverage,
            pnl: trade.pnl,
            status: trade.closePrice ? 'closed' : 'open',
            liquidated: trade.liquidated,
            createdAt: trade.createdAt,
            tradeType:trade.tradeType,
            duration: calculateDuration(trade.createdAt, new Date()),
            pnlPercentage: calculatePnlPercentage(trade),
            isProfitable: trade.pnl !== null && trade.pnl > 0,
            durationInSeconds: Math.floor((Date.now() - trade.createdAt.getTime()) / 1000)
        }));

        const analytics = {
            totalTrades: totalCount,
            openTrades: formattedTrades.filter(t => t.status === 'open').length,
            closedTrades: formattedTrades.filter(t => t.status === 'closed').length,
            profitableTrades: formattedTrades.filter(t => t.isProfitable).length,
            unprofitableTrades: formattedTrades.filter(t => !t.isProfitable && t.status === 'closed').length,
            liquidatedTrades: formattedTrades.filter(t => t.liquidated).length,
        };

        return jsonResponse({
            success: true,
            data: formattedTrades,
            analytics,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error("Get trade history error:", error);
        return jsonResponse({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error"
        }, 500);
    }
}
