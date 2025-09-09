"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Percent } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { Loader2 } from "lucide-react"


type Analytics = {
  totalTrades: number
  winRate: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  profitFactor: number
}

export function TradeAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiService.trading.getHistory({ limit: 100 })
        if (response.success && response.analytics) {
          // Calculate winRate, avgWin, avgLoss, largestWin, largestLoss, profitFactor
          const trades = response.data || []
          const wins = trades.filter((t: any) => t.pnl !== null && t.pnl > 0)
          const losses = trades.filter((t: any) => t.pnl !== null && t.pnl < 0)
          const totalPnL = trades.reduce((acc: number, t: any) => acc + (t.pnl || 0), 0)
          const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
          const avgWin = wins.length > 0 ? wins.reduce((acc: number, t: any) => acc + t.pnl, 0) / wins.length : 0
          const avgLoss = losses.length > 0 ? losses.reduce((acc: number, t: any) => acc + t.pnl, 0) / losses.length : 0
          const largestWin = wins.length > 0 ? Math.max(...wins.map((t: any) => t.pnl)) : 0
          const largestLoss = losses.length > 0 ? Math.min(...losses.map((t: any) => t.pnl)) : 0
          const grossProfit = wins.reduce((acc: number, t: any) => acc + t.pnl, 0)
          const grossLoss = Math.abs(losses.reduce((acc: number, t: any) => acc + t.pnl, 0))
          const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0
          setAnalytics({
            totalTrades: response.analytics.totalTrades,
            winRate: Number(winRate.toFixed(2)),
            totalPnL: Number(totalPnL.toFixed(2)),
            avgWin: Number(avgWin.toFixed(2)),
            avgLoss: Number(avgLoss.toFixed(2)),
            largestWin: Number(largestWin.toFixed(2)),
            largestLoss: Number(largestLoss.toFixed(2)),
            profitFactor: Number(profitFactor.toFixed(2)),
          })
        } else {
          setError(response.error || "Failed to load analytics")
        }
      } catch (err: any) {
        setError("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="text-center text-red-500 py-8">{error || "No analytics available"}</div>
    )
  }

  const isPositivePnL = analytics.totalPnL >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total P&L */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositivePnL ? "text-green-500" : "text-red-500"}`}>
            {isPositivePnL ? "+" : ""}${analytics.totalPnL.toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositivePnL ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            All time
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.winRate}%</div>
          <div className="text-xs text-muted-foreground">
            {Math.round((analytics.winRate / 100) * analytics.totalTrades)} wins of {analytics.totalTrades}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalTrades}</div>
          <div className="text-xs text-muted-foreground">Completed trades</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.profitFactor}</div>
          <div className="text-xs text-muted-foreground">Gross profit / Gross loss</div>
        </CardContent>
      </Card>

      {/* Average Win */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">+${analytics.avgWin}</div>
          <div className="text-xs text-muted-foreground">Per winning trade</div>
        </CardContent>
      </Card>

      {/* Average Loss */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{analytics.avgLoss}</div>
          <div className="text-xs text-muted-foreground">Per losing trade</div>
        </CardContent>
      </Card>

      {/* Largest Win */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Win</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">+${analytics.largestWin}</div>
          <div className="text-xs text-muted-foreground">Best single trade</div>
        </CardContent>
      </Card>

      {/* Largest Loss */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Loss</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{analytics.largestLoss}</div>
          <div className="text-xs text-muted-foreground">Worst single trade</div>
        </CardContent>
      </Card>
    </div>
  )
}
