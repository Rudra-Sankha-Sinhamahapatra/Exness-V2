"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown, X, Edit } from "lucide-react"
import { BACKEND_URL } from "@/config"


type Position = {
  id: string
  orderId: string
  asset: string
  type: "long" | "short"
  margin: number
  leverage: number
  entryPrice: number
  size: number
  pnl: number
  pnlPercent: number
  liquidationPrice: number
  timestamp: string | Date
}


export function OpenPositions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

      const fetchPositions = async () => {
      setLoading(true)
      try {
        const response = await apiService.trading.getHistory({ status: "open" })
        if (response.success && response.data) {
          const openPositions = response.data.map((trade: any) => ({
            id: trade.id ,
            orderId: trade.orderId,
            asset: trade.asset,
            type: trade.tradeType,
            margin: trade.margin,
            leverage: trade.leverage,
            entryPrice: trade.openPrice,
            size: trade.size ?? trade.margin * trade.leverage,
            pnl: trade.pnl ?? 0,
            pnlPercent: trade.pnlPercentage ?? 0,
            liquidationPrice: trade.liquidationPrice ?? 0,
            timestamp: trade.createdAt,
          }))
          setPositions(openPositions)
        } else {
          setPositions([])
        }
      } catch (error) {
        setPositions([])
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchPositions()
  }, [])

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/trade/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderId: positionId }),
      })

      if (response.ok) {
        setPositions((prev) => prev.filter((p) => p.id !== positionId))
        toast({
          title: "Position closed",
          description: "Your position has been successfully closed",
        })
      } else {
        toast({
          title: "Failed to close position",
          description: "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      fetchPositions()
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No open positions</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div key={position.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {position.type === "long" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-semibold">{position.asset}/USDC</span>
                    <Badge variant={position.type === "long" ? "default" : "destructive"}>
                      {position.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleClosePosition(position.orderId)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Entry Price</div>
                  <div className="font-medium">${position.entryPrice.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-muted-foreground">PnL</div>
                  <div className={`font-medium ${position.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                    <span className="text-xs ml-1">
                      ({position.pnl >= 0 ? "+" : ""}
                      {position.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>
                  Margin: ${position.margin} • {position.leverage}x
                </span>
                <span>Liq. Price: ${position.liquidationPrice.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
