"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { apiService } from "@/lib/api-service"


function groupTradesByDay(trades: any[], days: number) {
  // Create a map for each day in the range
  const today = new Date();
  const result: { date: string; dailyPnL: number; cumulativePnL: number; trades: number }[] = [];
  let cumulativePnL = 0;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString();
    // Find trades for this day
    const tradesForDay = trades.filter((t) => {
      const tDate = new Date(t.closedAt || t.createdAt);
      return tDate.toLocaleDateString() === dateStr;
    });
    const dailyPnL = tradesForDay.reduce((acc, t) => acc + (t.pnl || 0), 0);
    cumulativePnL += dailyPnL;
    result.push({
      date: dateStr,
      dailyPnL: Number(dailyPnL.toFixed(2)),
      cumulativePnL: Number(cumulativePnL.toFixed(2)),
      trades: tradesForDay.length,
    });
  }
  return result;
}


export function PerformanceChart() {
  const [timeframe, setTimeframe] = useState("30d")
  const [chartType, setChartType] = useState<"cumulative" | "daily">("cumulative")
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    apiService.trading.getHistory({ limit: 1000, sortBy: "createdAt", sortOrder: "desc",cacheOnly: true })
      .then((response: any) => {
        if (!isMounted) return;
        if (response.success && response.data) {
          const trades = response.data.filter((t: any) => t.status === "closed" && t.pnl !== null);
          const grouped = groupTradesByDay(trades, days);
          setPerformanceData(grouped);
        } else {
          setPerformanceData([]);
          setError("No data available");
        }
      })
      .catch(() => {
        if (isMounted) {
          setPerformanceData([]);
          setError("Failed to load performance data");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [timeframe]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
      );
    }
    return null;
  };

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
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">{error}</div>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
