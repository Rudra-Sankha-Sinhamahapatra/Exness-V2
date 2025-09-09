"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown, X, Edit } from "lucide-react"
import { BACKEND_URL } from "@/config"

// Mock data - in real app this would come from API
const mockPositions = [
  {
    id: "pos-1",
    asset: "BTC",
    type: "long" as const,
    margin: 1000,
    leverage: 10,
    entryPrice: 44800,
    currentPrice: 45200,
    size: 10000,
    pnl: 89.29,
    pnlPercent: 0.89,
    liquidationPrice: 40320,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "pos-2",
    asset: "ETH",
    type: "short" as const,
    margin: 500,
    leverage: 5,
    entryPrice: 3020,
    currentPrice: 2980,
    size: 2500,
    pnl: 66.23,
    pnlPercent: 1.32,
    liquidationPrice: 3624,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
]

export function OpenPositions() {
  const [positions, setPositions] = useState(mockPositions)
  const { toast } = useToast()

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
    }
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
                  <Button size="sm" variant="ghost" onClick={() => handleClosePosition(position.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-medium">${position.size.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-muted-foreground">Entry Price</div>
                  <div className="font-medium">${position.entryPrice.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-medium">${position.currentPrice.toLocaleString()}</div>
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
