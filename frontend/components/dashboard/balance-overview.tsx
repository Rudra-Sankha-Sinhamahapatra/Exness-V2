"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Wallet, DollarSign } from "lucide-react"
import { BACKEND_URL } from "@/config"

interface Balance {
  USDC: { balance: number; decimals: number }
  BTC: { balance: number; decimals: number }
  ETH: { balance: number; decimals: number }
  SOL: { balance: number; decimals: number }
}

export function BalanceOverview() {
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
    const interval = setInterval(fetchBalance, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatBalance = (balance: number, decimals: number) => {
    return (balance / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 6)
  }

  const calculateTotalUSD = () => {
    if (!balance) return 0
    const usdcValue = Number.parseFloat(formatBalance(balance.USDC.balance, balance.USDC.decimals))
    const btcValue = Number.parseFloat(formatBalance(balance.BTC.balance, balance.BTC.decimals)) * 45000 // Mock BTC price
    const ethValue = Number.parseFloat(formatBalance(balance.ETH.balance, balance.ETH.decimals)) * 3000 // Mock ETH price
    const solValue = Number.parseFloat(formatBalance(balance.SOL.balance, balance.SOL.decimals)) * 100 // Mock SOL price

    return usdcValue + btcValue + ethValue + solValue
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
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
          <div className="text-center text-muted-foreground">{error || "Unable to load balance"}</div>
        </CardContent>
      </Card>
    )
  }

  const totalUSD = calculateTotalUSD()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Portfolio Value */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalUSD.toLocaleString()}</div>
          <div className="flex items-center text-xs text-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            +2.5% (24h)
          </div>
        </CardContent>
      </Card>

      {/* USDC Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">USDC</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBalance(balance.USDC.balance, balance.USDC.decimals)}</div>
          <p className="text-xs text-muted-foreground">USD Coin</p>
        </CardContent>
      </Card>

      {/* BTC Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BTC</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBalance(balance.BTC.balance, balance.BTC.decimals)}</div>
          <p className="text-xs text-muted-foreground">Bitcoin</p>
        </CardContent>
      </Card>

      {/* ETH Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ETH</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBalance(balance.ETH.balance, balance.ETH.decimals)}</div>
          <p className="text-xs text-muted-foreground">Ethereum</p>
        </CardContent>
      </Card>

      {/* SOL Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SOL</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBalance(balance.SOL.balance, balance.SOL.decimals)}</div>
          <p className="text-xs text-muted-foreground">Solana</p>
        </CardContent>
      </Card>
    </div>
  )
}
