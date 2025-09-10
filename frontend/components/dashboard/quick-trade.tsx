"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown } from "lucide-react"
import { BACKEND_URL } from "@/config"

export function QuickTrade() {
  const [asset, setAsset] = useState<"BTC" | "ETH" | "SOL">("BTC")
  const [margin, setMargin] = useState("")
  const [leverage, setLeverage] = useState("1")
  const [slippage, setSlippage] = useState("100")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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
          leverage: Number.parseInt(leverage),
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
        <CardTitle>Quick Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset">Asset</Label>
          <Select value={asset} onValueChange={(value) => setAsset(value as "BTC" | "ETH" | "SOL")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
              <SelectItem value="SOL">Solana (SOL)</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leverage">Leverage</Label>
            <Select value={leverage} onValueChange={setLeverage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
                <SelectItem value="20">20x</SelectItem>
                <SelectItem value="50">50x</SelectItem>
                <SelectItem value="100">100x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippage">Slippage (%)</Label>
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
        </div>

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
      </CardContent>
    </Card>
  )
}
