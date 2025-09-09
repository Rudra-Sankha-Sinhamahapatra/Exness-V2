"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("http://localhost:3001/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage("Check your email for a magic link to sign in!")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to send magic link")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <ArrowLeft className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Back to home</span>
          </Link>
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">CryptoTrade Pro</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your trading account</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-400">Enter your email to receive a magic link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <Mail className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">{message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
