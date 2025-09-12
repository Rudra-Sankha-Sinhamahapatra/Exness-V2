"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { TradingChart } from "./trading-chart"
import { OrderBook } from "./order-book"
import { TradingForm } from "./trading-form"
import { OpenPositions } from "./open-positions"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TradingInterface() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "SOL">("BTC")
  const [refreshKey,setRefreshKey] = useState(0);

  const handleTradeSuccess = () => setRefreshKey((k) => k + 1);
  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        const klines = await apiService.market.getKlines(selectedAsset, "1m");
        if (isMounted && klines && klines.length > 0) {
          const last = klines[klines.length - 1];
          const price = typeof last.close === 'string' ? parseFloat(last.close) : last.close;
        }
      } catch (err) {
       
      } 
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedAsset]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-6">
  
        <div className="flex items-center gap-4 mb-2">
          <span className="font-semibold text-lg">Asset:</span>
          <Select value={selectedAsset} onValueChange={v => setSelectedAsset(v as "BTC" | "ETH" | "SOL") }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TradingChart asset={selectedAsset} />

  <OpenPositions refreshKey={refreshKey} onPositionClosed={handleTradeSuccess} />
      </div>
      <div className="xl:col-span-1 space-y-6">
        <TradingForm asset={selectedAsset} onTradeSuccess={handleTradeSuccess} />

        <OrderBook asset={selectedAsset} />
      </div>
    </div>
  )
}
