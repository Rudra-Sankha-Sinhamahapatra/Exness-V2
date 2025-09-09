"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Volume2 } from "lucide-react"

interface MarketStatsProps {
  selectedAsset: "BTC" | "ETH" | "SOL"
  onAssetChange: (asset: "BTC" | "ETH" | "SOL") => void
  currentPrice: number
}

export function MarketStats({ selectedAsset, onAssetChange, currentPrice }: MarketStatsProps) {
  const marketData = {
    BTC: {
      change24h: 2.34,
      high24h: 46200,
      low24h: 44800,
      volume24h: 28500000000,
      name: "Bitcoin",
    },
    ETH: {
      change24h: -1.23,
      high24h: 3100,
      low24h: 2950,
      volume24h: 15200000000,
      name: "Ethereum",
    },
    SOL: {
      change24h: 5.67,
      high24h: 105,
      low24h: 98,
      volume24h: 2100000000,
      name: "Solana",
    },
  }

  const data = marketData[selectedAsset]
  const isPositive = data.change24h >= 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Asset Selection */}
          <div className="flex items-center gap-4">
            <Tabs value={selectedAsset} onValueChange={(value) => onAssetChange(value as "BTC" | "ETH" | "SOL")}>
              <TabsList>
                <TabsTrigger value="BTC">BTC/USDC</TabsTrigger>
                <TabsTrigger value="ETH">ETH/USDC</TabsTrigger>
                <TabsTrigger value="SOL">SOL/USDC</TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <div className="text-sm text-muted-foreground">{data.name}</div>
              <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center lg:text-left">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                24h Change
              </div>
              <div className={`font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}
                {data.change24h.toFixed(2)}%
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                24h High
              </div>
              <div className="font-semibold">${data.high24h.toLocaleString()}</div>
            </div>

            <div className="text-center lg:text-left">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                24h Low
              </div>
              <div className="font-semibold">${data.low24h.toLocaleString()}</div>
            </div>

            <div className="text-center lg:text-left">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                24h Volume
              </div>
              <div className="font-semibold">${(data.volume24h / 1000000000).toFixed(1)}B</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
