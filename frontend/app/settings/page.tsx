import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("authToken")

  if (!authToken) {
    redirect("/signin")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <div className="text-sm text-muted-foreground">Manage your account preferences</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">Settings panel coming soon...</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
