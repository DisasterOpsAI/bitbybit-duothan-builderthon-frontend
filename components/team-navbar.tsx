"use client"

import { Button } from "@/components/ui/button"
import { Code, Trophy, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function TeamNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    localStorage.removeItem("teamName")
    router.push("/")
  }

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Code className="w-8 h-8 text-foreground" />
          <span className="text-xl font-bold text-foreground">OASIS Protocol</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/leaderboard">
            <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent bg-transparent">
                <User className="w-4 h-4 mr-2" />
                {user?.displayName || localStorage.getItem("teamName") || "Team"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border-border">
              <DropdownMenuItem onClick={handleSignOut} className="text-foreground hover:bg-accent">
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
