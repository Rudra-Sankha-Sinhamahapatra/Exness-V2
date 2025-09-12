"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderBookProps {
  asset: "BTC" | "ETH" | "SOL"
}

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

export function OrderBook({ asset }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [asks, setAsks] = useState<OrderBookEntry[]>([])

  useEffect(() => {
    let isMounted = true;
    const fetchOrderBook = async () => {
      try {
        const klines = await apiService.market.getKlines(asset, "1m");
        if (!isMounted || !klines || klines.length === 0) return;
 
        const last20 = klines.slice(-20);
        const asksRaw = last20.slice(-10);
        const bidsRaw = last20.slice(0, 10);

        const asks: OrderBookEntry[] = asksRaw.map((k: any) => {
          const price = typeof k.high === 'string' ? parseFloat(k.high) : k.high;
          const size = typeof k.volume === 'string' ? parseFloat(k.volume) : k.volume;
          return { price, size, total: 0 };
        });
        const bids: OrderBookEntry[] = bidsRaw.map((k: any) => {
          const price = typeof k.low === 'string' ? parseFloat(k.low) : k.low;
          const size = typeof k.volume === 'string' ? parseFloat(k.volume) : k.volume;
          return { price, size, total: 0 };
        });

        asks.sort((a, b) => a.price - b.price);
        bids.sort((a, b) => b.price - a.price);

        let total = 0;
        for (let i = 0; i < asks.length; i++) {
          total += asks[i].size;
          asks[i].total = total;
        }
        total = 0;
        for (let i = 0; i < bids.length; i++) {
          total += bids[i].size;
          bids[i].total = total;
        }

        setAsks(asks);
        setBids(bids);
      } catch (err) {
        setAsks([]);
        setBids([]);
      }
    };
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [asset]);

  const maxTotal = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total))

  const OrderBookRow = ({
    entry,
    type,
  }: {
    entry: OrderBookEntry
    type: "bid" | "ask"
  }) => (
    <div className="relative flex justify-between items-center py-1 px-2 text-xs hover:bg-muted/50">
  
      <div
        className={`absolute left-0 top-0 h-full opacity-20 ${type === "bid" ? "bg-green-500" : "bg-red-500"}`}
        style={{ width: `${(entry.total / maxTotal) * 100}%` }}
      />

      <span className={type === "bid" ? "text-green-500" : "text-red-500"}>${entry.price.toLocaleString()}</span>
      <span className="text-muted-foreground">{entry.size.toFixed(4)}</span>
      <span className="text-muted-foreground">{entry.total.toFixed(4)}</span>
    </div>
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Order Book</CardTitle>
          <Badge variant="outline" className="text-xs">
            {asset}/USDC
          </Badge>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground px-2">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-0.5">
            {asks.map((ask, index) => (
              <OrderBookRow key={`ask-${index}`} entry={ask} type="ask" />
            ))}
          </div>


          <div className="py-2 px-2 border-y border-border bg-muted/30">
            <div className="text-center text-xs">
              <div className="text-muted-foreground">Spread</div>
              <div className="font-medium">${(asks[asks.length - 1]?.price - bids[0]?.price || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-0.5">
            {bids.map((bid, index) => (
              <OrderBookRow key={`bid-${index}`} entry={bid} type="bid" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
