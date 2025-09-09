"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, X } from "lucide-react"
import { BACKEND_URL } from "@/config"

// Mock data - in real app this would come from API
const mockTrades = [
  {
    id: "1",
    asset: "BTC",
    type: "long" as const,
    margin: 1000,
    leverage: 10,
    entryPrice: 45000,
    currentPrice: 45500,
    pnl: 111.11,
    status: "open" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2",
    asset: "ETH",
    type: "short" as const,
    margin: 500,
    leverage: 5,
    entryPrice: 3000,
    currentPrice: 2950,
    pnl: 83.33,
    status: "open" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    asset: "SOL",
    type: "long" as const,
    margin: 200,
    leverage: 20,
    entryPrice: 100,
    currentPrice: 98,
    pnl: -80,
    status: "closed" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

export function RecentTrades() {
  const handleCloseTrade = async (orderId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/trade/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderId }),
      })

      if (response.ok) {
        // In real app, refresh the trades list
        console.log("Trade closed successfully")
      }
    } catch (error) {
      console.error("Failed to close trade:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {trade.type === "long" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{trade.asset}</span>
                  <Badge variant={trade.type === "long" ? "default" : "destructive"}>{trade.type.toUpperCase()}</Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  ${trade.margin} • {trade.leverage}x
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`font-medium ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground" suppressHydrationWarning>{trade.timestamp.toLocaleTimeString()}</div>
                </div>

                {trade.status === "open" && (
                  <Button size="sm" variant="ghost" onClick={() => handleCloseTrade(trade.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
