"use client"

import { Button } from "@/components/ui/button"
import { Code, LogOut, Shield, Users, Trophy, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminNavbar() {
  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem("adminToken")
    router.push("/auth/admin-login")
  }

  return (
    <nav className="border-b border-gray-600 bg-gray-800 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">OASIS Admin</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/admin/challenges">
            <Button variant="outline" className="text-white border-gray-500 hover:bg-gray-700 bg-transparent">
              <Code className="w-4 h-4 mr-2" />
              Challenges
            </Button>
          </Link>

          <Link href="/admin/teams">
            <Button variant="outline" className="text-white border-gray-500 hover:bg-gray-700 bg-transparent">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-white border-gray-500 hover:bg-gray-700 bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-500">
              <DropdownMenuItem asChild>
                <Link href="/admin/submissions" className="text-white hover:bg-gray-800 cursor-pointer">
                  <Trophy className="w-4 h-4 mr-2" />
                  Submissions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/analytics" className="text-white hover:bg-gray-800 cursor-pointer">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-gray-800">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
