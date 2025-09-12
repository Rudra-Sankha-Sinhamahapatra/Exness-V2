"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Search, Download, AlertCircle } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TradeDetailsDialog } from "./trade-details-dialog"
import { useRouter } from "next/navigation"

interface Trade {
  id: string
  orderId: string
  asset: string
  assetName?: string
  assetImage?: string
  openPrice: number
  closePrice: number | null
  leverage: number
  tradeType: "long" | "short"
  margin?: number
  pnl: number | null
  status: "open" | "closed"
  liquidated: boolean
  createdAt: string
  closedAt?: string
  duration: string
  pnlPercentage: number | null
  isProfitable?: boolean
}

export function TradeHistoryTable() {
  const { toast } = useToast()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [assetFilter, setAssetFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true)
      try {
        const filters: any = {
          sortBy,
          sortOrder,
          cacheOnly: true
        }
        
        if (assetFilter !== "all") {
          filters.asset = assetFilter
        }
        
        if (typeFilter !== "all") {
          filters.tradeType = typeFilter
        }
        
        if (statusFilter !== "all") {
          filters.status = statusFilter
        }
        
        const response = await apiService.trading.getHistory(filters)
        if (response.success && response.data) {
          setTrades(response.data)
        } else {
          toast({
            title: "Error fetching trade history",
            description: response.error || "Failed to load trade history",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Failed to fetch trades:", error)
        toast({
          title: "Error fetching trade history",
          description: "There was a problem loading your trade history",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [assetFilter, typeFilter, statusFilter, sortBy, sortOrder, toast])

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = 
      trade.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }
  
  const handleTradeClose = async (trade: Trade) => {
    try {
      const response = await apiService.trading.closePosition(trade.orderId)
      if (response.orderId) {
        const updatedTrades = trades.map(t => 
          t.orderId === trade.orderId ? { ...t, status: "closed" as const } : t
        )
        setTrades(updatedTrades)
        
        toast({
          title: "Position closed",
          description: `${trade.asset} position closed successfully`,
        })
      }
    } catch (error) {
      console.error("Failed to close position:", error)
      toast({
        title: "Failed to close position",
        description: "There was an error closing your position",
        variant: "destructive",
      })
    }
  }
  
  const openTradeDetails = (trade: Trade) => {
    setSelectedTrade(trade)
    setIsDetailsOpen(true)
  }

  const exportTrades = () => {
    const csvContent = [
      "Asset,Type,Entry Price,Exit Price,P&L,P&L %,Duration,Entry Time",
      ...filteredTrades.map(
        (trade) =>
          `${trade.asset},${trade.tradeType},${trade.openPrice},${trade.closePrice || "-"},${trade.pnl || 0},${trade.pnlPercentage || 0}%,${trade.duration},${new Date(trade.createdAt).toISOString()}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trade-history.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Trade History</CardTitle> 
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-48"
              />
            </div>

            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
              </SelectContent>
            </Select>

            {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select> */}
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={exportTrades}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
          <CardContent className="my-4">These trades are cached only.It gets reset every day at midnight 00:00 UTC. If you want to view latest, go to 
             <span
          className="pl-2 text-blue-500 cursor-pointer underline"
          onClick={() => {
            router.push("/dashboard");
          }}>Dashboard</span></CardContent>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("asset")}>
                    Asset
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("tradeType")}>
                    Type
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("openPrice")}>
                    Entry Price
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("closePrice")}>
                    Exit Price
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("leverage")}>
                    Leverage
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("pnl")}>
                    P&L
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("duration")}>
                    Duration
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    Status
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow 
                    key={trade.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openTradeDetails(trade)}
                  >
                    <TableCell className="font-medium">
                      <img src={trade.assetImage} alt={trade.assetName || trade.asset} className="h-6 w-6 inline-block mr-2 align-middle rounded-full bg-muted" suppressHydrationWarning={true} />
                      {trade.asset}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {trade.tradeType === "long" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={trade.tradeType === "long" ? "default" : "destructive"}>
                          {(trade.tradeType ? trade.tradeType.toUpperCase() : "-")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>${trade.openPrice.toLocaleString()}</TableCell>
                    <TableCell>{trade.closePrice ? `$${trade.closePrice.toLocaleString()}` : "—"}</TableCell>
                    <TableCell>{trade.leverage}×</TableCell>
                    <TableCell>
                      {trade.pnl !== null ? (
                        <div className={`font-medium ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {trade.pnl >= 0 ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
                          {trade.pnlPercentage !== null && (
                            <div className="text-xs">
                              ({trade.pnlPercentage >= 0 ? "+" : ""}
                              {trade.pnlPercentage.toFixed(2)}%)
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{trade.duration}</TableCell>
                    <TableCell>
                      <Badge variant={trade.status === "open" ? "outline" : "secondary"}>
                        {trade.status.toUpperCase()}
                      </Badge>
                      {trade.liquidated && (
                        <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          LIQUIDATED
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {trade.status === "open" && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTradeClose(trade);
                          }}
                        >
                          Close
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && filteredTrades.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No trades found matching your criteria</div>
        )}
        
        {selectedTrade && (
          <TradeDetailsDialog 
            trade={selectedTrade}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            onTradeClose={handleTradeClose}
          />
        )}
      </CardContent>
    </Card>
  )
}
