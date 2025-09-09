import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TradeHistoryTable } from "@/components/history/trade-history-table"
import { TradeAnalytics } from "@/components/history/trade-analytics"
import { PerformanceChart } from "@/components/history/performance-chart"

export default async function HistoryPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("authToken")

  if (!authToken) {
    redirect("/signin")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Trade History</h1>
          <div className="text-sm text-muted-foreground">Track your trading performance</div>
        </div>

        {/* Analytics Overview */}
        <TradeAnalytics />

        {/* Performance Chart */}
        <PerformanceChart />

        {/* Trade History Table */}
        <TradeHistoryTable />
      </div>
    </DashboardLayout>
  )
}
