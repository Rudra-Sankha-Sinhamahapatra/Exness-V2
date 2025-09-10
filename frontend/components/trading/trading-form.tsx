"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown, Calculator } from "lucide-react"
import { BACKEND_URL } from "@/config"

interface TradingFormProps {
  asset: "BTC" | "ETH" | "SOL"
}

export function TradingForm({ asset }: TradingFormProps) {
  const [orderType, setOrderType] = useState<"market">("market")
  const [margin, setMargin] = useState("")
  const [leverage, setLeverage] = useState([10])
  const [slippage, setSlippage] = useState("100")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const calculatePositionSize = () => {
    const marginValue = Number.parseFloat(margin) || 0
    const leverageValue = leverage[0]
    return marginValue * leverageValue
  }

  const calculatePnL = (type: "long" | "short", priceChange: number) => {
    const positionSize = calculatePositionSize()
    const pnlPercent = type === "long" ? priceChange : -priceChange
    return (positionSize * pnlPercent) / 100
  }

  const handleTrade = async (type: "long" | "short") => {
    if (!margin || Number.parseFloat(margin) < 1) {
      toast({
        title: "Invalid margin",
        description: "Margin must be at least $1",
        variant: "destructive",
      })
      return
    }


    setIsLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/trade/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          asset,
          type,
          margin: Number.parseFloat(margin) * 100, 
          leverage: leverage[0],
          slippage: Number.parseInt(slippage),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Trade executed",
          description: `${type.toUpperCase()} position opened for ${asset}`,
        })
        setMargin("")
      } else {
        toast({
          title: "Trade failed",
          description: data.message || data.error || "Failed to execute trade",
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
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Place Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as "market")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="margin">Margin (USD)</Label>
            <Input
              id="margin"
              type="number"
              placeholder="Enter margin amount"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Leverage</Label>
              <span className="text-sm font-medium">{leverage[0]}x</span>
            </div>
            <Slider value={leverage} onValueChange={setLeverage} max={100} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1x</span>
              <span>50x</span>
              <span>100x</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippage">Slippage Tolerance</Label>
            <Select value={slippage} onValueChange={setSlippage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">0.1%</SelectItem>
                <SelectItem value="50">0.5%</SelectItem>
                <SelectItem value="100">1%</SelectItem>
                <SelectItem value="300">3%</SelectItem>
                <SelectItem value="500">5%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {margin && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="text-sm font-medium">Position Details</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Position Size: ${calculatePositionSize().toLocaleString()}</div>
                <div>Liquidation: ~{leverage[0] > 1 ? (100 / leverage[0]).toFixed(1) : "N/A"}%</div>
                <div className="text-green-500">+1% PnL: ${calculatePnL("long", 1).toFixed(2)}</div>
                <div className="text-red-500">-1% PnL: ${calculatePnL("long", -1).toFixed(2)}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => handleTrade("long")}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Long
            </Button>
            <Button onClick={() => handleTrade("short")} disabled={isLoading} variant="destructive">
              <TrendingDown className="h-4 w-4 mr-2" />
              Short
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
