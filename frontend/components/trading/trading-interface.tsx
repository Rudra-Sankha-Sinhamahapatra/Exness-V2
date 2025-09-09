"use client"

import { useState, useEffect } from "react"
import { TradingChart } from "./trading-chart"
import { OrderBook } from "./order-book"
import { TradingForm } from "./trading-form"
import { MarketStats } from "./market-stats"
import { OpenPositions } from "./open-positions"

export function TradingInterface() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "SOL">("BTC")
  const [currentPrice, setCurrentPrice] = useState<number>(0)

  useEffect(() => {
    const mockPrices = { BTC: 45000, ETH: 3000, SOL: 100 }
    const basePrice = mockPrices[selectedAsset]

    const updatePrice = () => {
      const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
      setCurrentPrice(basePrice * (1 + variation))
    }

    updatePrice()
    const interval = setInterval(updatePrice, 2000)
    return () => clearInterval(interval)
  }, [selectedAsset])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Left Column - Chart and Market Stats */}
      <div className="xl:col-span-3 space-y-6">
        {/* Market Selection and Stats */}
        <MarketStats selectedAsset={selectedAsset} onAssetChange={setSelectedAsset} currentPrice={currentPrice} />

        {/* Trading Chart */}
        <TradingChart asset={selectedAsset} />

        {/* Open Positions */}
        <OpenPositions />
      </div>

      {/* Right Column - Trading Form and Order Book */}
      <div className="xl:col-span-1 space-y-6">
        {/* Trading Form */}
        <TradingForm asset={selectedAsset} currentPrice={currentPrice} />

        {/* Order Book */}
        <OrderBook asset={selectedAsset} />
      </div>
    </div>
  )
}
