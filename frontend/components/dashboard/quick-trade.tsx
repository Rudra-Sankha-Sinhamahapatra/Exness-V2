"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickTrade() {
  const router = useRouter()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Trade</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="text-center text-muted-foreground text-sm">
          Want to place a trade? Use the full trading interface for advanced options.
        </div>
        <Button size="lg" className="w-full max-w-xs" onClick={() => router.push("/markets")}>Trade Now</Button>
      </CardContent>
    </Card>
  )
}
