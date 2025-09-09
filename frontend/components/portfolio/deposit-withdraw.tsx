"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Copy, ArrowDownToLine, ArrowUpFromLine, QrCode } from "lucide-react"

export function DepositWithdraw() {
  const [selectedAsset, setSelectedAsset] = useState("USDC")
  const [amount, setAmount] = useState("")
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mock deposit addresses
  const depositAddresses = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ETH: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    SOL: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    USDC: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address copied",
      description: "Deposit address copied to clipboard",
    })
  }

  const handleWithdraw = async () => {
    if (!amount || !withdrawAddress) {
      toast({
        title: "Missing information",
        description: "Please enter amount and withdrawal address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Mock withdrawal process
    setTimeout(() => {
      toast({
        title: "Withdrawal initiated",
        description: `${amount} ${selectedAsset} withdrawal request submitted`,
      })
      setAmount("")
      setWithdrawAddress("")
      setIsLoading(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5" />
          Deposit & Withdraw
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deposit Address</Label>
              <div className="flex gap-2">
                <Input
                  value={depositAddresses[selectedAsset as keyof typeof depositAddresses]}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyAddress(depositAddresses[selectedAsset as keyof typeof depositAddresses])}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <QrCode className="h-4 w-4" />
                QR Code
              </div>
              <div className="w-32 h-32 bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center mx-auto">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Only send {selectedAsset} to this address</p>
              <p>• Minimum deposit: 0.001 {selectedAsset}</p>
              <p>• Deposits require 3 network confirmations</p>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Withdrawal Address</Label>
              <Input
                id="address"
                placeholder="Enter destination address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <Button onClick={handleWithdraw} disabled={isLoading} className="w-full">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Minimum withdrawal: 0.01 {selectedAsset}</p>
              <p>• Network fee: ~0.001 {selectedAsset}</p>
              <p>• Processing time: 10-30 minutes</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
