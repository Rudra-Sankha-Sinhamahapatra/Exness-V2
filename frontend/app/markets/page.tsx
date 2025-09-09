import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TradingInterface } from "@/components/trading/trading-interface"

export default async function MarketsPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("authToken")

  if (!authToken) {
    redirect("/signin")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Markets & Trading</h1>
          <div className="text-sm text-muted-foreground">Real-time market data</div>
        </div>

        <TradingInterface />
      </div>
    </DashboardLayout>
  )
}
