"use client"

import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Shield, Zap, BarChart3, Users, Globe } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/trading-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Trade Crypto Like a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Professional
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 text-balance max-w-3xl mx-auto">
            Advanced trading tools, real-time market data, and institutional-grade security for the modern crypto
            trader.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                Start Trading Now
              </Button>
            </Link>
            <Link href="/markets">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
              >
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose CryptoTrade Pro?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for traders who demand the best tools and security in the crypto market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bank-Grade Security</h3>
                <p className="text-gray-400">
                  Multi-layer security with cold storage, 2FA, and advanced encryption to keep your assets safe.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-400">
                  Execute trades in milliseconds with our high-performance matching engine and real-time data feeds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-400">
                  Professional charting tools, technical indicators, and portfolio analytics to make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-400">
                  Round-the-clock customer support from our team of crypto trading experts whenever you need help.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Global Access</h3>
                <p className="text-gray-400">
                  Trade from anywhere in the world with our mobile-optimized platform and multi-language support.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
                <p className="text-gray-400">
                  Competitive trading fees with volume discounts and no hidden charges. More profit in your pocket.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of traders who trust CryptoTrade Pro for their crypto investments.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
                <Footer />
    </div>
  )
}
