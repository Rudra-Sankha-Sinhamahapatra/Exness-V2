"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  TrendingUp, TrendingDown, Search, Filter } from "lucide-react"

type Transaction = {
  id: string
  asset: string
  assetName: string
  assetImage: string
  openPrice: number
  closePrice: number
  leverage: number
  pnl: number
  pnlPercentage: number
  status: string
  liquidated: boolean
  createdAt: string
  duration: string
  orderId: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const response = await apiService.trading.getHistory()
        if (response.success && response.data) {
          const txs = response.data.map((trade: any) => ({
            id: trade.id || trade.orderId,
            asset: trade.asset,
            assetName: trade.assetName,
            assetImage: trade.assetImage,
            openPrice: trade.openPrice,
            closePrice: trade.closePrice,
            leverage: trade.leverage,
            pnl: trade.pnl,
            pnlPercentage: trade.pnlPercentage,
            status: trade.status,
            liquidated: trade.liquidated,
            createdAt: trade.createdAt,
            duration: trade.duration,
            orderId: trade.orderId,
          }))
          setTransactions(txs)
        } else {
          setTransactions([])
        }
      } catch (error) {
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || filter === "trade"
    const matchesSearch =
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getTransactionIcon = (pnl: number, liquidated: boolean) => {
    if (liquidated) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return pnl >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: string, liquidated: boolean) => {
    if (liquidated) {
      return <Badge variant="destructive">Liquidated</Badge>
    }
    switch (status) {
      case "closed":
        return <Badge variant="secondary">Closed</Badge>
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdraw">Withdrawals</SelectItem>
                <SelectItem value="trade">Trades</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <img src={tx.assetImage} alt={tx.assetName} className="h-8 w-8 rounded-full bg-muted" />
                  {getTransactionIcon(tx.pnl, tx.liquidated)}
                  <div>
                    <div className="font-medium capitalize">
                      {tx.assetName} <span className="text-xs text-muted-foreground">x{tx.leverage}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Entry: {tx.openPrice} | Exit: {tx.closePrice}</div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()} | {tx.duration}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-medium ${tx.pnl && tx.pnl > 0 ? "text-green-500" : tx.pnl && tx.pnl < 0 ? "text-red-500" : ""}`}>
                      {tx.pnl != null ? (
                        <>
                          {tx.pnl > 0 ? "+" : tx.pnl < 0 ? "-" : ""}
                          {Math.abs(tx.pnl)} {tx.asset}
                        </>
                      ) : (
                        <>-- {tx.asset}</>
                      )}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {tx.pnlPercentage != null ? `(${tx.pnlPercentage > 0 ? "+" : ""}${tx.pnlPercentage.toFixed(2)}%)` : "(--%)"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{tx.orderId}</div>
                  </div>

                  {getStatusBadge(tx.status, tx.liquidated)}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredTransactions.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button variant="outline">Load More</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
