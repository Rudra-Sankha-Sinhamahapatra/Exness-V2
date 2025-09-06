export function calculateLiquidationPrice(
    type: 'long' | 'short',
    entryPrice: bigint,
    margin: bigint,
    leverage: number,
    decimals: number
): bigint {
    const usdcDecimals = 2;
    
    const entryPriceNormal = Number(entryPrice) / (10 ** decimals);
    const marginNormal = Number(margin) / (10 ** usdcDecimals);
    const totalPosition = marginNormal * leverage;
    const assetAmount = totalPosition / entryPriceNormal;
    
    let actualWithoutUserMargin;
    if (type === 'long') {
        actualWithoutUserMargin = totalPosition - marginNormal;
    } else {
        actualWithoutUserMargin = totalPosition + marginNormal;
    }
    
    const liquidationPrice = actualWithoutUserMargin / assetAmount;
    
    return BigInt(Math.round(liquidationPrice * (10 ** decimals)));
}