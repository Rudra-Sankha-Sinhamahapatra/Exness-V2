"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Asssets } from "@/config/assets"

interface MarketStatsProps {
  selectedAsset: "BTC" | "ETH" | "SOL"
  onAssetChange: (asset: "BTC" | "ETH" | "SOL") => void
  currentPrice: number
  assetName: string
}

export function MarketStats({ selectedAsset, onAssetChange, currentPrice,assetName }: MarketStatsProps) {

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Asset Selection */}
          <div className="flex items-center gap-4">
            <Tabs value={selectedAsset} onValueChange={(value) => onAssetChange(value as "BTC" | "ETH" | "SOL")}> 
              <TabsList>
                <TabsTrigger value="BTC">
                  <img
                    src={Asssets.find((assset) => "BTC" === assset.symbol)?.imageUrl}
                    alt="BTC"
                             className="w-6 h-6 inline-block"
                  />
                  BTC
                </TabsTrigger>
                <TabsTrigger value="ETH">
                    <img
                    src={Asssets.find((assset) => "ETH" === assset.symbol)?.imageUrl}
                    alt="ETH"
                             className="w-6 h-6 inline-block"
                  />
                  ETH
                  </TabsTrigger>
                <TabsTrigger value="SOL">
                    <img
                    src={Asssets.find((assset) => "SOL" === assset.symbol)?.imageUrl}
                    alt="SOL"
                    className="w-6 h-6 inline-block"
                  />
                  SOL
                  </TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <div className="text-sm text-muted-foreground">{assetName}</div>
              <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
