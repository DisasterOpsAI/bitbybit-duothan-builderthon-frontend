"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Trophy, Calendar, Search, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"

interface Submission {
  id: string
  teamName: string
  challengeTitle: string
  challengeType: 'algorithmic' | 'buildathon'
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
  language?: string
  githubLink?: string
  points: number
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchSubmissions()
  }, [router])

  useEffect(() => {
    // Filter submissions based on search query and filters
    let filtered = submissions

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(submission =>
        submission.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.challengeTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(submission => submission.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(submission => submission.challengeType === typeFilter)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchQuery, statusFilter, typeFilter])

  const fetchSubmissions = async () => {
    try {
      const response = await ApiClient.makeAdminRequest('/api/admin/submissions')
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Accepted</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Pending</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'algorithmic':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Algorithmic</Badge>
      case 'buildathon':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Buildathon</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen oasis-bg">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Loading submissions...</div>
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
            <h1 className="text-4xl font-bold text-white mb-2">Submissions</h1>
            <p className="text-white/70">Review and manage team submissions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-white/20 text-white placeholder-white/50"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-black/40 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-black/40 border-white/20 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="algorithmic">Algorithmic</SelectItem>
              <SelectItem value="buildathon">Buildathon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Trophy className="w-4 h-4 mr-2 text-blue-400" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{submissions.length}</div>
              <p className="text-xs text-white/60">All submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                Accepted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {submissions.filter(s => s.status === 'accepted').length}
              </div>
              <p className="text-xs text-white/60">Successful solutions</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <p className="text-xs text-white/60">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-sm">
                <Code className="w-4 h-4 mr-2 text-purple-400" />
                Buildathon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {submissions.filter(s => s.challengeType === 'buildathon').length}
              </div>
              <p className="text-xs text-white/60">Project submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(submission.status)}
                      <h3 className="text-white text-lg font-semibold">{submission.challengeTitle}</h3>
                      {getTypeBadge(submission.challengeType)}
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/70">Team</span>
                          <span className="text-white">{submission.teamName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Submitted</span>
                          <span className="text-white">{formatDate(submission.submittedAt)}</span>
                        </div>
                        {submission.language && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Language</span>
                            <span className="text-white">{submission.language}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/70">Points</span>
                          <span className="text-white">{submission.points}</span>
                        </div>
                        {submission.githubLink && (
                          <div className="flex justify-between">
                            <span className="text-white/70">GitHub</span>
                            <a 
                              href={submission.githubLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Repo
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-white border-white/30 hover:bg-white/10 bg-transparent"
                      onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <div className="text-white text-xl mb-2">No submissions found</div>
              <div className="text-white/70">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all" 
                  ? 'Try adjusting your filters' 
                  : 'No submissions have been made yet'}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}