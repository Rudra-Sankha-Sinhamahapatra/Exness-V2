"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Mock performance data
const generatePerformanceData = (days: number) => {
  const data = []
  let cumulativePnL = 0

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    // Simulate daily P&L with some volatility
    const dailyPnL = (Math.random() - 0.4) * 200 // Slightly positive bias
    cumulativePnL += dailyPnL

    data.push({
      date: date.toLocaleDateString(),
      dailyPnL: Number.parseFloat(dailyPnL.toFixed(2)),
      cumulativePnL: Number.parseFloat(cumulativePnL.toFixed(2)),
      trades: Math.floor(Math.random() * 5) + 1,
    })
  }

  return data
}

export function PerformanceChart() {
  const [timeframe, setTimeframe] = useState("30d")
  const [chartType, setChartType] = useState<"cumulative" | "daily">("cumulative")

  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90
  const performanceData = generatePerformanceData(days)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {chartType === "cumulative" ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Cumulative P&L:</span>
                <span className={data.cumulativePnL >= 0 ? "text-green-500" : "text-red-500"}>
                  ${data.cumulativePnL.toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Daily P&L:</span>
                <span className={data.dailyPnL >= 0 ? "text-green-500" : "text-red-500"}>
                  ${data.dailyPnL.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Trades:</span>
              <span>{data.trades}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Chart</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as "cumulative" | "daily")}>
              <TabsList>
                <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "cumulative" ? (
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativePnL"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.2}
                />
              </AreaChart>
            ) : (
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="dailyPnL"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
