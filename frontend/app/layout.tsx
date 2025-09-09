import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import NavbarServer  from "@/components/layout/navbarServer"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "CryptoTrade Pro",
  description: "Professional crypto trading platform",
  generator: "Rudra Sankha Sinhamahapatra",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <NavbarServer />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
