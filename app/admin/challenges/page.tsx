"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Code, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Flag } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Challenge {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  status: "draft" | "active" | "archived"
  submissions: number
  completions: number
  createdAt: string
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchChallenges()
  }, [router])

  const fetchChallenges = async () => {
    try {
      // TODO: Backend Integration Point 10
      // Fetch all challenges for admin
      const response = await fetch("/api/admin/challenges", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChallenges(data)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChallenge = async (challengeId: string) => {
    try {
      // TODO: Backend Integration Point 11
      // Delete challenge
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        setChallenges((prev) => prev.filter((c) => c.id !== challengeId))
      }
    } catch (error) {
      console.error("Failed to delete challenge:", error)
    }
  }

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Hard":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "archived":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen oasis-bg">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Loading challenges...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen oasis-bg">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Challenge Management</h1>
            <p className="text-white/70">Create and manage algorithmic and buildathon challenges</p>
          </div>
          <Link href="/admin/challenges/create">
            <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="bg-black/40 border-white/20 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges Table */}
        <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Code className="w-5 h-5 mr-2" />
              All Challenges ({filteredChallenges.length})
            </CardTitle>
            <CardDescription className="text-white/70">
              Manage your algorithmic and buildathon challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Difficulty</TableHead>
                  <TableHead className="text-white">Points</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Submissions</TableHead>
                  <TableHead className="text-white">Completions</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChallenges.map((challenge) => (
                  <TableRow key={challenge.id} className="border-white/20">
                    <TableCell className="text-white font-medium">{challenge.title}</TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-white">{challenge.points}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(challenge.status)}>{challenge.status}</Badge>
                    </TableCell>
                    <TableCell className="text-white">{challenge.submissions}</TableCell>
                    <TableCell className="text-white">{challenge.completions}</TableCell>
                    <TableCell className="text-white/70">{challenge.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/90 border-white/20">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/challenges/${challenge.id}`}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/challenges/${challenge.id}/edit`}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/challenges/${challenge.id}/flag`}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Manage Flag
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black/90 border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Challenge</AlertDialogTitle>
                                <AlertDialogDescription className="text-white/70">
                                  Are you sure you want to delete "{challenge.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-white border-white/30 hover:bg-white/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteChallenge(challenge.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredChallenges.length === 0 && (
              <div className="text-center py-12">
                <Code className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Challenges Found</h3>
                <p className="text-white/70 mb-6">
                  {searchTerm ? "No challenges match your search." : "Create your first challenge to get started."}
                </p>
                {!searchTerm && (
                  <Link href="/admin/challenges/create">
                    <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Challenge
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
