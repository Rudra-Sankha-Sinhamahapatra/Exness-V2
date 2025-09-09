import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BalanceOverview } from "@/components/dashboard/balance-overview"
import { MarketOverview } from "@/components/dashboard/market-overview"
import { QuickTrade } from "@/components/dashboard/quick-trade"
import { RecentTrades } from "@/components/dashboard/recent-trades"

export default async function DashboardPage() {
  // Auth check is now handled by middleware

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
          <div className="text-sm text-muted-foreground">Last updated: <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span></div>
        </div>

        {/* Balance Overview */}
        <BalanceOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Overview - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MarketOverview />
          </div>

          {/* Quick Trade Panel */}
          <div className="lg:col-span-1">
            <QuickTrade />
          </div>
        </div>

        {/* Recent Trades */}
        <RecentTrades />
      </div>
    </DashboardLayout>
  )
}
