"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { BACKEND_URL } from "@/config"

interface Balance {
  USDC: { balance: number; decimals: number }
  BTC: { balance: number; decimals: number }
  ETH: { balance: number; decimals: number }
  SOL: { balance: number; decimals: number }
}

export function AssetAllocation() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/balance`, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setBalance(data)
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const formatBalance = (balance: number, decimals: number) => {
    return (balance / Math.pow(10, decimals)).toFixed(decimals === 6 ? 2 : 6)
  }

  const calculateAssetData = () => {
    if (!balance) return []

    const mockPrices = { BTC: 45000, ETH: 3000, SOL: 100, USDC: 1 }
    const assets = Object.keys(balance) as (keyof Balance)[]

    const assetData = assets.map((asset) => {
      const amount = Number.parseFloat(formatBalance(balance[asset].balance, balance[asset].decimals))
      const value = amount * mockPrices[asset]
      return {
        name: asset,
        amount,
        value,
        color: {
          BTC: "#f7931a",
          ETH: "#627eea",
          SOL: "#9945ff",
          USDC: "#2775ca",
        }[asset],
      }
    })

    const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0)

    return assetData.map((asset) => ({
      ...asset,
      percentage: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
    }))
  }

  const assetData = calculateAssetData()
  const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">Loading allocation data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
   
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                  labelFormatter={(label) => `${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {assetData.map((asset) => (
              <div key={asset.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                    <span className="font-medium">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${asset.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{asset.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={asset.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {asset.amount.toFixed(asset.name === "USDC" ? 2 : 6)} {asset.name}
                  </span>
                  <span>${((asset.value / totalValue) * 100).toFixed(1)}% of portfolio</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
