"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, X } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api-service"

type Trade = {
  id: string
  orderId: string
  asset: string
  assetName?: string
  assetImage?: string
  tradeType: "long" | "short"
  margin: number
  leverage: number
  openPrice: number
  closePrice?: number
  pnl: number
  status: "open" | "closed"
  createdAt: string
}


export function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [closingId, setClosingId] = useState<string | null>(null)

  const fetchOpenTrades = async () => {
    setLoading(true)
    try {
      const response = await apiService.trading.getHistory()
      if (response.success && response.data) {
        setTrades(response.data)
      } else {
        setTrades([])
      }
    } catch (error) {
      setTrades([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpenTrades()
  }, [])

  const handleCloseTrade = async (orderId: string) => {
    setClosingId(orderId)
    try {
      const response = await apiService.trading.closePosition(orderId)
      if (response && response.orderId) {
        fetchOpenTrades()
      }
    } catch (error) {
      console.error("Failed to close trade:", error)
    } finally {
      setClosingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : trades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No open trades</div>
          ) : (
            trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                   <div>
                      Open Price: ${trade.openPrice}
                    </div>
                  <div className="flex items-center gap-2">
                    {trade.tradeType === "long" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{trade.asset}</span>
                    <Badge variant={trade.tradeType === "long" ? "default" : "destructive"}>{trade.tradeType.toUpperCase()}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    ${trade.margin} • {trade.leverage}x
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-medium ${trade.pnl && trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {trade.pnl && trade.pnl >= 0 ? "+" : ""}${trade.pnl && trade.pnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground" suppressHydrationWarning>{new Date(trade.createdAt).toLocaleTimeString()}</div>
                   {trade.closePrice ?? <div>Closed at: ${trade.closePrice}</div>}
                  </div>

                  {trade.status === "open" && (
                    <Button size="sm" variant="ghost" onClick={() => handleCloseTrade(trade.orderId)} disabled={closingId === trade.orderId}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
