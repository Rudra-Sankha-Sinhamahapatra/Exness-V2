"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, LoaderCircle } from "lucide-react"
import TradingViewChart from "@/components/trading/TradingViewChart"
import { OHLCData } from "@/types/chartPage"
import { apiService } from "@/lib/api-service"

export function MarketOverview() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "SOL">("BTC")
  const [klineData, setKlineData] = useState<OHLCData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKlines = async () => {
      setLoading(true)
      try {
        const data = await apiService.market.getKlines(selectedAsset, "1h");
        console.log("Market overview data:", data.slice(0, 2))
        setKlineData(data)
      } catch (error) {
        console.error("Failed to fetch klines:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchKlines()
    
    const timerId = setTimeout(fetchKlines, 60000);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [selectedAsset])

  // Get latest candle for stats
  const latest = klineData.length > 0 ? klineData[klineData.length - 1] : undefined;
  const prev = klineData.length > 1 ? klineData[klineData.length - 2] : undefined;
  const currentPrice = latest ? (typeof latest.close === 'string' ? parseFloat(latest.close) : latest.close) : 0;
  const previousPrice = prev ? (typeof prev.close === 'string' ? parseFloat(prev.close) : prev.close) : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  // Parse volume, quoteVolume, trades
  const volume = latest ? (typeof latest.volume === 'string' ? parseFloat(latest.volume) : latest.volume) : 0;
  const quoteVolume = latest && latest.quoteVolume ? parseFloat(latest.quoteVolume as string) : 0;
  const trades = latest && latest.trades ? latest.trades : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Market Overview</CardTitle>
          <Tabs value={selectedAsset} onValueChange={(value) => setSelectedAsset(value as "BTC" | "ETH" | "SOL")}> 
            <TabsList>
              <TabsTrigger value="BTC">BTC</TabsTrigger>
              <TabsTrigger value="ETH">ETH</TabsTrigger>
              <TabsTrigger value="SOL">SOL</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-2xl font-bold">${currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            <div 
              className={`flex items-center text-sm ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
              suppressHydrationWarning
            >
              {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {priceChange >= 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}% (1h)
            </div>
            {/* Show volume, quoteVolume, trades for latest candle */}
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span>Vol: <span className="text-white">{volume?.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></span>
              <span>QuoteVol: <span className="text-white">{quoteVolume?.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></span>
              <span>Trades: <span className="text-white">{trades}</span></span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 rounded-md">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : null}
          {klineData.length > 0 ? (
            <TradingViewChart data={klineData} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for {selectedAsset}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
