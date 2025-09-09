"use client"

import { useState, useEffect } from "react"
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
    const generateOrderBook = () => {
      const basePrices = { BTC: 45000, ETH: 3000, SOL: 100 }
      const basePrice = basePrices[asset]

      const newBids: OrderBookEntry[] = []
      const newAsks: OrderBookEntry[] = []


      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * (basePrice * 0.001)
        const size = Math.random() * 10 + 1
        const total = i === 0 ? size : newBids[i - 1].total + size
        newBids.push({ price, size, total })
      }

      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * (basePrice * 0.001)
        const size = Math.random() * 10 + 1
        const total = i === 0 ? size : newAsks[i - 1].total + size
        newAsks.push({ price, size, total })
      }

      setBids(newBids)
      setAsks(newAsks.reverse()) 
    }

    generateOrderBook()
    const interval = setInterval(generateOrderBook, 3000)
    return () => clearInterval(interval)
  }, [asset])

  const maxTotal = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total))

  const OrderBookRow = ({
    entry,
    type,
  }: {
    entry: OrderBookEntry
    type: "bid" | "ask"
  }) => (
    <div className="relative flex justify-between items-center py-1 px-2 text-xs hover:bg-muted/50">
      {/* Background bar showing depth */}
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

        {/* Header */}
        <div className="flex justify-between text-xs text-muted-foreground px-2">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {/* Asks (Sell Orders) */}
          <div className="space-y-0.5">
            {asks.map((ask, index) => (
              <OrderBookRow key={`ask-${index}`} entry={ask} type="ask" />
            ))}
          </div>

          {/* Spread */}
          <div className="py-2 px-2 border-y border-border bg-muted/30">
            <div className="text-center text-xs">
              <div className="text-muted-foreground">Spread</div>
              <div className="font-medium">${(asks[asks.length - 1]?.price - bids[0]?.price || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Bids (Buy Orders) */}
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
