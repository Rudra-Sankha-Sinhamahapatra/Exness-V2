import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TradeHistoryTable } from "@/components/history/trade-history-table"
import { TradeAnalytics } from "@/components/history/trade-analytics"
import { PerformanceChart } from "@/components/history/performance-chart"
import { CardContent } from "@/components/ui/card"

export default async function HistoryPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("authToken")

  if (!authToken) {
    redirect("/signin")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex max-md:flex-col items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Trade History</h1> <br />
          <CardContent>Trade History Refreshes every midnight UTC 00:00</CardContent>
          <div className="text-sm text-muted-foreground">Track your trading performance</div>
        </div>

        <TradeAnalytics />

        <PerformanceChart />

        <TradeHistoryTable />
      </div>
    </DashboardLayout>
  )
}
