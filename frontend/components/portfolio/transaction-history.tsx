"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, Search, Filter } from "lucide-react"

// Mock transaction data
const mockTransactions = [
  {
    id: "tx-1",
    type: "deposit" as const,
    asset: "USDC",
    amount: 5000,
    status: "completed" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    txHash: "0x1234...5678",
  },
  {
    id: "tx-2",
    type: "trade" as const,
    asset: "BTC",
    amount: 0.1,
    status: "completed" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    txHash: "0xabcd...efgh",
    tradeType: "buy",
  },
  {
    id: "tx-3",
    type: "withdraw" as const,
    asset: "ETH",
    amount: 1.5,
    status: "pending" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    txHash: "0x9876...5432",
  },
  {
    id: "tx-4",
    type: "trade" as const,
    asset: "SOL",
    amount: 50,
    status: "completed" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    txHash: "0xfedc...ba98",
    tradeType: "sell",
  },
]

export function TransactionHistory() {
  const [transactions] = useState(mockTransactions)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || tx.type === filter
    const matchesSearch =
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getTransactionIcon = (type: string, tradeType?: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownToLine className="h-4 w-4 text-green-500" />
      case "withdraw":
        return <ArrowUpFromLine className="h-4 w-4 text-red-500" />
      case "trade":
        return tradeType === "buy" ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        )
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
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(tx.type, (tx as any).tradeType)}

                  <div>
                    <div className="font-medium capitalize">
                      {tx.type === "trade" ? `${(tx as any).tradeType} ${tx.asset}` : `${tx.type} ${tx.asset}`}
                    </div>
                    <div className="text-sm text-muted-foreground">{tx.timestamp.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">
                      {tx.type === "withdraw" || (tx.type === "trade" && (tx as any).tradeType === "sell") ? "-" : "+"}
                      {tx.amount} {tx.asset}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{tx.txHash}</div>
                  </div>

                  {getStatusBadge(tx.status)}
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
