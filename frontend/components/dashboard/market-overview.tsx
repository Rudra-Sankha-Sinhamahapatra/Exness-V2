"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoaderCircle } from "lucide-react"
import TradingViewChart from "@/components/trading/TradingViewChart"
import { OHLCData } from "@/types/chartPage"
import { apiService } from "@/lib/api-service"
import { MarketStats } from "@/components/trading/market-stats"

export function MarketOverview() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "SOL">("BTC")
  const [klineData, setKlineData] = useState<OHLCData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKlines = async () => {
      setLoading(true)
      try {
        const data = await apiService.market.getKlines(selectedAsset, "1h");
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

  let high24h = 0, low24h = 0, change24h = 0;
  let assetName: string = selectedAsset;
  const currentPrice = klineData.length > 0
    ? parseFloat(String(klineData[klineData.length - 1].close))
    : 0;
  if (klineData.length > 0) {
    const last24 = klineData.slice(-24);
    high24h = Math.max(...last24.map(k => typeof k.high === 'string' ? parseFloat(k.high) : k.high));
    low24h = Math.min(...last24.map(k => typeof k.low === 'string' ? parseFloat(k.low) : k.low));
    const first = last24[0];
    const firstClose = typeof first.close === 'string' ? parseFloat(first.close) : first.close;
    change24h = ((currentPrice - firstClose) / firstClose) * 100;

    if (selectedAsset === 'BTC') assetName = 'Bitcoin';
    if (selectedAsset === 'ETH') assetName = 'Ethereum';
    if (selectedAsset === 'SOL') assetName = 'Solana';
  }

  return (
    <div className="flex flex-col gap-4">
      <MarketStats
        selectedAsset={selectedAsset}
        onAssetChange={setSelectedAsset}
        currentPrice={currentPrice}
        assetName={assetName}
      />
      <Card>
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
    </div>
  )
}
