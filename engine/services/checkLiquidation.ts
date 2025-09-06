import { latestAssetPrices, type Asset } from "../store/assetPrice";
import { trades } from "../store/trade";
import { calculatePnL } from "./calculatePnL";
import { queueDBOperation } from "./queueDb";

export function checkLiquidations(asset: Asset, currentPrice: bigint) {
    for(const [orderId, trade] of trades) {
    if (trade.asset === asset && trade.status === 'open') {
        const pnlResult = calculatePnL(
            trade.type,
            trade.entryPrice,
            currentPrice,
            trade.margin,
            trade.leverage,
            latestAssetPrices[asset].decimals,
            trade.liquidationPrice
        );

        if(pnlResult.isLiquidated) {
            console.log(`Auto liquidation trade ${orderId}`);

            trade.status = 'closed';

            queueDBOperation('UPDATE_TRADE', {
                orderId: trade.orderId,
                closePrice: Number(currentPrice) / (10 ** latestAssetPrices[asset].decimals),
                pnl: Number(pnlResult.pnl) / 100,
                liquidated: true
            })
        }
    }
    }
}