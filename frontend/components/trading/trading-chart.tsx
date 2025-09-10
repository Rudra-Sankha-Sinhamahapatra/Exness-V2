"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BACKEND_URL } from "@/config"
import TradingViewChart from "./TradingViewChart"
import { LoaderCircle } from "lucide-react"
import { OHLCData } from "@/types/chartPage"
import { Asssets } from "@/config/assets"

interface TradingChartProps {
  asset: "BTC" | "ETH" | "SOL",
}


export function TradingChart({ asset }: TradingChartProps) {
  const [interval, setInterval] = useState("1h")
  const [klineData, setKlineData] = useState<OHLCData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKlines = async () => {
      setLoading(true)
      try {
        console.log(`Fetching klines for ${asset} with interval ${interval}`)
        const response = await fetch(`${BACKEND_URL}/api/v1/klines?asset=${asset}&interval=${interval}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Klines data received:", data.slice(0, 2))
          setKlineData(data)
        } else {
          console.error("Failed to fetch klines:", response.status)
        }
      } catch (error) {
        console.error("Error fetching klines:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchKlines();
    
    // Set up polling for live updates
    const timerId = setTimeout(fetchKlines, 30000); // Update every 30 seconds
    
    return () => {
      clearTimeout(timerId);
    };
  }, [asset, interval])

  // Get latest candle for stats
  const latest = klineData.length > 0 ? klineData[klineData.length - 1] : undefined;
  const prev = klineData.length > 1 ? klineData[klineData.length - 2] : undefined;
  const currentPrice = latest ? (typeof latest.close === 'string' ? parseFloat(latest.close) : latest.close) : 0;
  const previousPrice = prev ? (typeof prev.close === 'string' ? parseFloat(prev.close) : prev.close) : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const percentChange = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const volume = latest ? (typeof latest.volume === 'string' ? parseFloat(latest.volume) : latest.volume) : 0;
  const quoteVolume = latest && latest.quoteVolume ? parseFloat(latest.quoteVolume as string) : 0;
  const trades = latest && latest.trades ? latest.trades : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <img
                src={Asssets.find((assset) => asset === assset.symbol)?.imageUrl}
                alt={asset}
                className="w-6 h-6 inline-block"
              /> {asset} Chart
              {loading && <LoaderCircle className="animate-spin h-4 w-4" />}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold">${currentPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              <span 
                className={`text-sm ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
                suppressHydrationWarning
              >
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
              </span>
            </div>
            {/* Show volume, quoteVolume, trades for latest candle */}
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span>Vol: <span className="text-white">{volume?.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></span>
              <span>QuoteVol: <span className="text-white">{quoteVolume?.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></span>
              <span>Trades: <span className="text-white">{trades}</span></span>
            </div>
          </div>
          <Tabs value={interval} onValueChange={setInterval}>
            <TabsList>
              <TabsTrigger value="1m">1m</TabsTrigger>
              <TabsTrigger value="5m">5m</TabsTrigger>
              <TabsTrigger value="1h">1h</TabsTrigger>
              <TabsTrigger value="4h">4h</TabsTrigger>
              <TabsTrigger value="1d">1d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 relative">
          {loading && klineData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
              <div className="flex flex-col items-center gap-2">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : null}
          {klineData.length > 0 ? (
            <TradingViewChart data={klineData} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for {asset}/{interval}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
