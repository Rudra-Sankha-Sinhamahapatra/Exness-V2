import { prisma } from "@exness/db";
import { REDIS_SENDER_QUEUE } from "../redis";
import { calculatePnL } from "../services/calculatePnL";
import { latestAssetPrices, type Asset } from "../store/assetPrice";
import { getUserBalance, initializeBalance, updateUserBalance } from "../store/balance";
import { closeTrade, createTrade, getTrade } from "../store/trade";

type EventData = {
    email: string;
    event?: string;
    responseChannel?: string;
    orderId?: string;
    asset?: string;
    type?: 'long' | 'short';
    margin?: number;
    leverage?: number;
    slippage?: number;
}

function serializeBigInt(data: any): string {
    return JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    );
}

export async function Processor(event: string | undefined, data: EventData) {
    let result;

    try {
        console.log("Processing event:", event, "for email:", data.email);

        switch (event) {
            case "GET_USER_BALANCE":
                result = getUserBalance(data.email);
                console.log("Getting balance for:", data.email);
                break;

            case "GET_USDC_BALANCE":
                const balance = getUserBalance(data.email);
                if (!balance) {
                    throw new Error("Balance not found");
                }
                result = {
                    email: data.email,
                    usdc: balance.usdc
                };
                console.log("Getting USDC balance for:", data.email, result);
                break;

            case "INITIALIZE_WALLET":
                const existingBalance = getUserBalance(data.email);
                if (existingBalance) {
                    console.log("Wallet already exists for:", data.email);
                    result = existingBalance;
                } else {
                    result = initializeBalance(data.email);
                    console.log("Initialized wallet for:", data.email);
                }
                break;

            case "CREATE_TRADE":
                if (!data.asset || !data.type || !data.margin || !data.leverage || !data.orderId) {
                    throw new Error("Missing trade parameters");
                }

                const existingAsset = await prisma.asset.findUnique({
                    where: {symbol: data.asset}
                });

                if(!existingAsset) {
                    throw new Error("Invalid asset");
                }

                const userBalance = getUserBalance(data.email);
                if (!userBalance) {
                    throw new Error("User balance not found");
                }

                const marginBigInt = BigInt(data.margin);
                if (userBalance.usdc.balance < marginBigInt) {
                    throw new Error("Insufficient margin");
                }

                const entryPrice = latestAssetPrices[data.asset as Asset].price;
                const itemDecimal = latestAssetPrices[data.asset as Asset].decimals;

                if (entryPrice === undefined || entryPrice === null) {
                    throw new Error("Asset price not available");
                }

                userBalance.usdc.balance -= marginBigInt;
                updateUserBalance(data.email, userBalance);

                result = createTrade({
                    orderId: data.orderId,
                    email: data.email,
                    asset: data.asset as Asset,
                    type: data.type,
                    margin: marginBigInt,
                    leverage: data.leverage,
                    entryPrice: entryPrice,
                    slippage: data.slippage || 0,
                    status: 'open',
                    timestamp: Date.now()
                })

                const assetRow = await prisma.asset.findUnique({
                    where: {
                        symbol: data.asset
                    }
                })

                if(!assetRow) {
                    throw new Error("Invalid Asset")
                }

                const userRow = await prisma.user.upsert({
                    where: { email: data.email },
                    update: {},
                    create: { email: data.email },
                });

                const openPrice = Number(entryPrice) / 10 ** itemDecimal;

                await prisma.existingTrade.create({
                    data: {
                        orderId: data.orderId!,
                        openPrice,
                        leverage: data.leverage!,
                        liquidated: false,
                        asset: { connect: { id: assetRow.id } },
                        user: { connect: { id: userRow.id } },
                    }
                })

                console.log('Trade executed:', result);
                break;

            case "CLOSE_TRADE":
                if (!data.orderId) {
                    throw new Error("Missing order id");
                }
                const trade = getTrade(data.orderId);
                if (!trade) {
                    throw new Error("Trade not found");
                }
                if (trade.status === 'closed') {
                    throw new Error("Trade is already closed")
                }

                if (trade.email !== data.email) {
                    throw new Error('Unauthorized to close this trade');
                }

                const userBalanceForClose = getUserBalance(data.email);
                if (!userBalanceForClose) {
                    throw new Error("User balance not found");
                }

                const currentPrice = latestAssetPrices[trade.asset].price;
                const assetDecimals = latestAssetPrices[trade.asset].decimals;

                const resultPNL = calculatePnL(
                    trade.type,
                    Number(trade.entryPrice),
                    Number(currentPrice),
                    Number(trade.margin),
                    trade.leverage,
                    assetDecimals
                )

               const pnl = BigInt(resultPNL.pnl);
                const isLiquidated = resultPNL.isLiquidated;

                if (userBalanceForClose) {
                    if (pnl < 0n) {  // Loss scenario
                        if (-pnl >= trade.margin) {
                            // Complete liquidation - user loses entire margin
                            userBalanceForClose.usdc.balance += 0n;
                            console.log("Trade liquidated, margin lost:", trade.margin.toString());
                        } else {
                            // Partial loss - remaining margin after loss
                            const remainingMargin = trade.margin + pnl;
                            userBalanceForClose.usdc.balance += remainingMargin;
                            console.log("Trade closed with loss, returning:", remainingMargin.toString());
                        }
                    } else {
                        // Profit or no loss scenario
                        const profitAmount = trade.margin + pnl;
                        userBalanceForClose.usdc.balance += profitAmount;
                        console.log(`Trade closed with ${pnl===0n?"No profit no loss":"Profit"}, returning:`, profitAmount.toString());
                    }
                    updateUserBalance(data.email, userBalanceForClose)
                }

                const closePrice = Number(currentPrice) / 10 ** assetDecimals;
                const rawPnlFloat = Number(pnl) / Number(10n ** BigInt(userBalanceForClose.usdc.decimals));
                const pnlFloat = Number(rawPnlFloat.toFixed(2));

                await prisma.existingTrade.update({
                    where: {
                        orderId: data.orderId!
                    },
                    data: {
                        closePrice,
                        pnl: pnlFloat,
                        liquidated: isLiquidated
                    }
                })
                result = {
                    ...closeTrade(data.orderId),
                    pnl: pnl,
                    isLiquidated
                };
                console.log("Trade closed with PnL:", ((Number(pnl)/ 10 ** 2).toString()));
                break;

            default:
                console.log("Unknown event:", event);
                throw new Error(`Unknown event: ${event}`);
        }

        if (data.responseChannel && result) {
            await REDIS_SENDER_QUEUE.lpush(data.responseChannel, serializeBigInt({
                success: true,
                data: result
            }));

            await REDIS_SENDER_QUEUE.expire(data.responseChannel, 60); // auto-clean after 60s

        }

        return result;
    } catch (error) {
        console.error("Processor error:", error);
        if (data.responseChannel) {
            await REDIS_SENDER_QUEUE.lpush(
                data.responseChannel,
                JSON.stringify({
                    success: false,
                    errorCode: error instanceof Error ? error.message : "INTERNAL_ERROR",
                    message:
                        error instanceof Error ? error.message : "Internal error",
                    httpStatus: ((): number => {
                        const msg = error instanceof Error ? error.message : "";
                        if (msg === "Trade not found") return 404;
                        if (msg === "Trade is already closed") return 409;
                        if (msg === "Unauthorized to close this trade") return 403;
                        if (msg === "Missing order id") return 400;
                        return 500;
                    })(),
                })
            );
            await REDIS_SENDER_QUEUE.expire(data.responseChannel, 60);
        }
        return null;
    }
}