interface PNL {
    pnl: number;
    isLiquidated: boolean
}

const usdcDecimals = 2;

export function calculatePnL(
    type: 'long' | 'short',
    entryPrice: bigint | number,
    currentPrice: bigint | number,
    margin: bigint | number,
    leverage: number,
    decimals: number
): PNL {
     try {
    
    console.log('PnL Calculation inputs (after conversion):', {
        type,
        entryPrice: entryPrice.toString(),
        currentPrice: currentPrice.toString(),
        margin: margin.toString(),
        leverage: leverage.toString(),
        decimals
    });

        const entryPriceNormal = Number(entryPrice) / (10 ** decimals);
        const currentPriceNormal = Number(currentPrice) / (10 ** decimals);
        const marginNormal = Number(margin)/(10 ** usdcDecimals);
        const totalPosition = marginNormal * leverage;

     const assetAmount = totalPosition / entryPriceNormal;


     let actualWithoutUserMargin;

      if(type === 'long') {
     actualWithoutUserMargin = totalPosition - marginNormal;
    } else {
        actualWithoutUserMargin = totalPosition + marginNormal;
    }

     const liquidationPrice = actualWithoutUserMargin / assetAmount;
     const finalLiquidationPrice = Number(liquidationPrice)

      let pnl:number = 0;
      let diff;
      let pnlNormal;
    if (type === 'long') {
        // completely liquidated
       if(currentPriceNormal <= finalLiquidationPrice) {
        pnl = -Number(margin)
       } else if(currentPriceNormal < entryPriceNormal && currentPriceNormal > liquidationPrice) {
        // partial loss
         diff = entryPriceNormal - currentPriceNormal;
         pnlNormal = -diff * assetAmount;
         pnl = Number(Math.round(pnlNormal * (10 ** usdcDecimals)));
       } else if(currentPriceNormal > entryPriceNormal && currentPriceNormal > liquidationPrice)  {
        // profit
        diff = currentPriceNormal - entryPriceNormal;
        pnlNormal = diff * assetAmount;
          pnl = Number(Math.round(pnlNormal * (10 ** usdcDecimals)));
       }
    } else {
        // completely liquidated
        if(currentPriceNormal>= finalLiquidationPrice) {
            pnl = -Number(margin);
        } else if (currentPriceNormal > entryPriceNormal && currentPriceNormal < liquidationPrice) {
            // partial loss
            diff = currentPriceNormal - entryPriceNormal;
            pnlNormal = -diff * assetAmount;
             pnl = Number(Math.round(pnlNormal * (10 ** usdcDecimals)));
        } else if(currentPriceNormal < entryPriceNormal && currentPriceNormal < liquidationPrice) {
            // profit
            diff = entryPriceNormal - currentPriceNormal;
            pnlNormal = diff * assetAmount;
             pnl = Number(Math.round(pnlNormal * (10 ** usdcDecimals)));
        }
    }

    const  isLiquidated = type === 'long' 
                ? currentPriceNormal <= liquidationPrice 
                : currentPriceNormal >= liquidationPrice

          console.log('Final calculation:', {
            pnlInTokens: Number(pnl) / (10 ** decimals),
            pnlRaw: pnl.toString(),
            isLiquidated
        });

    return {pnl:pnl,isLiquidated:isLiquidated}
} catch(error) {
    console.error("Failed to calculate PNL: ",error);
    return {pnl:0,isLiquidated:false}
}
}