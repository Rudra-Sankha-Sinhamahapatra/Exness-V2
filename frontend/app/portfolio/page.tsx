import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview"
import { AssetAllocation } from "@/components/portfolio/asset-allocation"
import { TransactionHistory } from "@/components/portfolio/transaction-history"
import { DepositWithdraw } from "@/components/portfolio/deposit-withdraw"

export default async function PortfolioPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("authToken")

  if (!authToken) {
    redirect("/signin")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
          <div className="text-sm text-muted-foreground">Manage your assets and balances</div>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Allocation - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AssetAllocation />
          </div>

          {/* Deposit/Withdraw Panel */}
          <div className="lg:col-span-1">
            <DepositWithdraw />
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory />
      </div>
    </DashboardLayout>
  )
}
