export function calculatePnL(
    type: 'long' | 'short',
    entryPrice: bigint | number,
    currentPrice: bigint | number,
    margin: bigint | number,
    leverage: number,
    decimals: number
): bigint {
     try {
    const entryPriceBigInt = BigInt(entryPrice);
    const currentPriceBigInt = BigInt(currentPrice);
    const marginBigInt = BigInt(margin);
    const leverageBigInt = BigInt(leverage);
    const decimalsBigInt = BigInt(10 ** decimals);

    console.log('PnL Calculation inputs (after conversion):', {
        type,
        entryPrice: entryPriceBigInt.toString(),
        currentPrice: currentPriceBigInt.toString(),
        margin: marginBigInt.toString(),
        leverage: leverageBigInt.toString(),
        decimals
    });
    // asset amount with decimal precison
    // Example: 5000 USDC position / 45000 USDC/BTC = 0.1111... BTC
    // We multiply by 10^decimals before division to preserve precision
    const totalPosition = marginBigInt * leverageBigInt;
     const assetAmount = (totalPosition * decimalsBigInt) / entryPriceBigInt;

      let pnl: bigint;
    if (type === 'long') {
        pnl = ((currentPriceBigInt - entryPriceBigInt) * assetAmount) / decimalsBigInt;
    } else {
        pnl = ((entryPriceBigInt - currentPriceBigInt) * assetAmount) / decimalsBigInt;
    }

    console.log('PnL Calculation result:', pnl.toString());
    return pnl
} catch(error) {
    console.error("Failed to calculate PNL: ",error);
    return BigInt(0);
}
}