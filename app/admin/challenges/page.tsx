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
      } else {
        console.error("Failed to fetch challenges:", response.status)
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
        return "bg-background text-foreground border-border"
      case "Medium":
        return "bg-muted text-muted-foreground border-border"
      case "Hard":
        return "bg-card text-card-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-background text-foreground border-border"
      case "draft":
        return "bg-muted text-muted-foreground border-border"
      case "archived":
        return "bg-card text-card-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading challenges...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Challenge Management</h1>
            <p className="text-muted-foreground">Create and manage algorithmic and buildathon challenges</p>
          </div>
          <Link href="/admin/challenges/create">
            <Button className="accent-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="surface-elevated mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges Table */}
        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Code className="w-5 h-5 mr-2" />
              All Challenges ({filteredChallenges.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your algorithmic and buildathon challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Title</TableHead>
                  <TableHead className="text-foreground">Difficulty</TableHead>
                  <TableHead className="text-foreground">Points</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Submissions</TableHead>
                  <TableHead className="text-foreground">Completions</TableHead>
                  <TableHead className="text-foreground">Created</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChallenges.map((challenge) => (
                  <TableRow key={challenge.id} className="border-border">
                    <TableCell className="text-foreground font-medium">{challenge.title}</TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{challenge.points}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(challenge.status)}>{challenge.status}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{challenge.submissions}</TableCell>
                    <TableCell className="text-foreground">{challenge.completions}</TableCell>
                    <TableCell className="text-muted-foreground">{challenge.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-foreground hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border-border">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/challenges/${challenge.id}`}
                              className="text-foreground hover:bg-muted cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/challenges/${challenge.id}/edit`}
                              className="text-foreground hover:bg-muted cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/challenges/${challenge.id}/flag`}
                              className="text-foreground hover:bg-muted cursor-pointer"
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Manage Flag
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive hover:bg-muted"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Delete Challenge</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  Are you sure you want to delete "{challenge.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-foreground border-border hover:bg-muted">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteChallenge(challenge.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Challenges Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "No challenges match your search." : "Create your first challenge to get started."}
                </p>
                {!searchTerm && (
                  <Link href="/admin/challenges/create">
                    <Button className="accent-button">
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
