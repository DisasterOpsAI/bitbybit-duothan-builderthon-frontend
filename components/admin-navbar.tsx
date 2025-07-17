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
    <nav className="border-b border-border bg-card backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">OASIS Admin</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/admin/challenges">
            <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent">
              <Code className="w-4 h-4 mr-2" />
              Challenges
            </Button>
          </Link>

          <Link href="/admin/teams">
            <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border backdrop-blur-sm">
              <DropdownMenuItem asChild>
                <Link href="/admin/submissions" className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <Trophy className="w-4 h-4 mr-2" />
                  Submissions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/analytics" className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleSignOut} className="text-foreground hover:bg-destructive hover:text-destructive-foreground">
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
