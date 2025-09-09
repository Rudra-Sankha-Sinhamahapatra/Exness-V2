"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X, User, LogOut, Settings, BarChart3 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type Props = {
  isAuthenticated: boolean;
};

export default function NavbarClient({ isAuthenticated: initialAuth }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const router = useRouter();


  const handleLogout = async () => {
    router.push("/signin");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">CryptoTrade Pro</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/markets" className="text-gray-300 hover:text-white transition-colors">Markets</Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">Portfolio</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/signin"><Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button></Link>
                <Link href="/signup"><Button className="bg-purple-600 hover:bg-purple-700 text-white">Sign Up</Button></Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative h-10 w-10 rounded-full overflow-hidden focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
                      <User className="h-5 w-5" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                align="end" 
                className="w-56 bg-black border border-white/10 z-50"
                sideOffset={8}>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">User</p>
                      <p className="text-xs text-gray-400">user@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <Link href="/dashboard"><DropdownMenuItem className="cursor-pointer flex items-center gap-2"><BarChart3 className="h-4 w-4" /><span>Dashboard</span></DropdownMenuItem></Link>
                  <Link href="/settings"><DropdownMenuItem className="cursor-pointer flex items-center gap-2"><Settings className="h-4 w-4" /><span>Settings</span></DropdownMenuItem></Link>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="cursor-pointer text-red-500 flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /><span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/markets" className="text-gray-300 hover:text-white transition-colors">Markets</Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">Portfolio</Link>

              <div className="flex flex-col space-y-2 pt-4">
                {!isAuthenticated ? (
                  <>
                    <Link href="/signin"><Button variant="ghost" className="w-full text-white hover:bg-white/10">Sign In</Button></Link>
                    <Link href="/signup"><Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Sign Up</Button></Link>
                  </>
                ) : (
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <div className="flex items-center gap-2 p-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white"><User className="h-4 w-4" /></div>
                      <div><p className="text-sm font-medium text-white">User</p><p className="text-xs text-gray-400">user@example.com</p></div>
                    </div>
                    <Link href="/settings"><Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10"><Settings className="h-4 w-4 mr-2" />Settings</Button></Link>
                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
