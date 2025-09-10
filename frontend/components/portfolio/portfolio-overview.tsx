"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart } from "lucide-react"
import { BACKEND_URL } from "@/config"

interface Balance {
  USDC: { balance: number; decimals: number }
  BTC: { balance: number; decimals: number }
  ETH: { balance: number; decimals: number }
  SOL: { balance: number; decimals: number }
}

export function PortfolioOverview() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/balance`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setBalance(data)
        } else {
          setError("Failed to fetch balance")
        }
      } catch (err) {
        setError("Network error")
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatBalance = (balance: number, decimals: number) => {
    return (balance / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 6)
  }

  const calculateAssetValue = (asset: keyof Balance, mockPrice: number) => {
    if (!balance) return 0
    return Number.parseFloat(formatBalance(balance[asset].balance, balance[asset].decimals)) * mockPrice
  }

  const calculateTotalValue = () => {
    if (!balance) return 0
    const usdcValue = calculateAssetValue("USDC", 1)
    const btcValue = calculateAssetValue("BTC", 45000)
    const ethValue = calculateAssetValue("ETH", 3000)
    const solValue = calculateAssetValue("SOL", 100)
    return usdcValue + btcValue + ethValue + solValue
  }

  const calculate24hChange = () => {
    return Math.random() * 10 - 5 
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !balance) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">{error || "Unable to load portfolio"}</div>
        </CardContent>
      </Card>
    )
  }

  const totalValue = calculateTotalValue()
  const change24h = calculate24hChange()
  const isPositive = change24h >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          <div className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {isPositive ? "+" : ""}
            {change24h.toFixed(2)}% (24h)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${calculateAssetValue("USDC", 1).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">USDC Available</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground">BTC, ETH, SOL, USDC</p>
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Holding</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(() => {
              const values = {
                BTC: calculateAssetValue("BTC", 45000),
                ETH: calculateAssetValue("ETH", 3000),
                SOL: calculateAssetValue("SOL", 100),
                USDC: calculateAssetValue("USDC", 1),
              }
              const largest = Object.entries(values).reduce((a, b) =>
                values[a[0] as keyof typeof values] > values[b[0] as keyof typeof values] ? a : b,
              )
              return largest[0]
            })()}
          </div>
          <p className="text-xs text-muted-foreground">By value</p>
        </CardContent>
      </Card>
    </div>
  )
}
