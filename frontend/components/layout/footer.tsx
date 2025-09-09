import Link from "next/link"
import { TrendingUp, Twitter, Github, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">CryptoTrade Pro</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Professional crypto trading platform with advanced tools, real-time data, and secure trading
              infrastructure for both beginners and experts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link href="/markets" className="block text-gray-400 hover:text-white transition-colors">
                Markets
              </Link>
              <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/portfolio" className="block text-gray-400 hover:text-white transition-colors">
                Portfolio
              </Link>
              <Link href="/history" className="block text-gray-400 hover:text-white transition-colors">
                Trade History
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="/api" className="block text-gray-400 hover:text-white transition-colors">
                API Docs
              </Link>
              <Link href="/security" className="block text-gray-400 hover:text-white transition-colors">
                Security
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 CryptoTrade Pro. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
