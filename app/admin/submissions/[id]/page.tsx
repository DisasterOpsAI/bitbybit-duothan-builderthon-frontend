"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  GitBranch, 
  Trophy, 
  Users, 
  Calendar,
  Clock,
  ArrowLeft,
  Code
} from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"

interface Submission {
  id: string
  teamId: string
  teamName: string
  challengeId: string
  challengeTitle: string
  type: "algorithmic" | "buildathon"
  content: string
  status: "pending" | "accepted" | "rejected"
  submittedAt: string
  points: number
  feedback?: string
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [customPoints, setCustomPoints] = useState(0)

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/auth/admin-login")
      return
    }

    fetchSubmission()
  }, [router, submissionId])

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubmission(data)
        setFeedback(data.feedback || "")
        setCustomPoints(data.points || 0)
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/auth/admin-login")
      } else if (response.status === 404) {
        setError("Submission not found")
      } else {
        setError("Failed to fetch submission")
      }
    } catch (error) {
      console.error("Failed to fetch submission:", error)
      setError("Failed to fetch submission")
    } finally {
      setIsLoading(false)
    }
  }

  const reviewSubmission = async (action: "accept" | "reject") => {
    setIsReviewing(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/submissions/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          submissionId,
          action,
          feedback: feedback.trim() || undefined,
          points: customPoints,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        // Refresh submission data
        fetchSubmission()
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/admin/submissions")
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${action} submission`)
      }
    } catch (error) {
      setError(`Failed to ${action} submission`)
    } finally {
      setIsReviewing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-muted/20 text-muted-foreground border-border">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "algorithmic":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30"><Code className="w-3 h-3 mr-1" />Algorithmic</Badge>
      case "buildathon":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30"><GitBranch className="w-3 h-3 mr-1" />Buildathon</Badge>
      default:
        return <Badge className="bg-muted/20 text-muted-foreground border-border">{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Loading submission...</div>
        </div>
      </div>
    )
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-red-400 text-xl">{error}</div>
          <Button 
            onClick={() => router.push("/admin/submissions")} 
            className="mt-4 bg-transparent text-foreground border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-foreground text-xl">Submission not found</div>
          <Button 
            onClick={() => router.push("/admin/submissions")} 
            className="mt-4 bg-transparent text-foreground border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            onClick={() => router.push("/admin/submissions")} 
            className="mb-4 bg-transparent text-foreground border-border hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Submission Review</h1>
              <p className="text-muted-foreground">Review and evaluate team submission</p>
            </div>
            <div className="flex gap-2">
              {getTypeBadge(submission.type)}
              {getStatusBadge(submission.status)}
            </div>
          </div>
        </div>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10 mb-6">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 mb-6">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submission Details */}
          <div className="space-y-6">
            <Card className="surface-elevated border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Team Name</Label>
                    <div className="text-muted-foreground font-medium">{submission.teamName}</div>
                  </div>
                  <div>
                    <Label className="text-foreground">Team ID</Label>
                    <div className="text-muted-foreground font-mono text-sm">{submission.teamId}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-elevated border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Challenge Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Challenge Title</Label>
                    <div className="text-muted-foreground font-medium">{submission.challengeTitle}</div>
                  </div>
                  <div>
                    <Label className="text-foreground">Points</Label>
                    <div className="text-muted-foreground font-medium flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      {submission.points}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Challenge ID</Label>
                  <div className="text-muted-foreground font-mono text-sm">{submission.challengeId}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-elevated border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Submitted At</Label>
                    <div className="text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground">Type</Label>
                    <div className="text-muted-foreground capitalize">{submission.type}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-foreground">Submission ID</Label>
                  <div className="text-muted-foreground font-mono text-sm">{submission.id}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Content & Review */}
          <div className="space-y-6">
            <Card className="surface-elevated border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Submission Content</CardTitle>
              </CardHeader>
              <CardContent>
                {submission.type === "buildathon" ? (
                  <div className="space-y-4">
                    <div className="surface-elevated p-4 rounded border border-border">
                      <Label className="text-foreground">GitHub Repository</Label>
                      <div className="mt-2">
                        <a
                          href={submission.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-lg"
                        >
                          <GitBranch className="w-5 h-5" />
                          {submission.content}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => window.open(submission.content, '_blank')}
                        className="accent-button"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Repository
                      </Button>
                      <Button
                        onClick={() => window.open(`${submission.content}/issues`, '_blank')}
                        className="surface-elevated text-foreground hover:bg-muted"
                      >
                        <GitBranch className="w-4 h-4 mr-2" />
                        View Issues
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="surface-elevated p-4 rounded border border-border">
                    <Label className="text-foreground">Algorithmic Solution</Label>
                    <div className="mt-2">
                      <code className="text-green-400 text-lg">{submission.content}</code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {submission.status === "pending" && (
              <Card className="surface-elevated border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Review Submission</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Review this submission and provide feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="points" className="text-foreground">
                        Points to Award
                      </Label>
                      <Input
                        id="points"
                        type="number"
                        min="0"
                        value={customPoints}
                        onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
                        className="surface-elevated border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">Default Points</Label>
                      <div className="text-muted-foreground surface-elevated border border-border rounded px-3 py-2">
                        {submission.points}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedback" className="text-foreground">
                      Feedback (Optional)
                    </Label>
                    <Textarea
                      id="feedback"
                      placeholder="Provide feedback for the team..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="surface-elevated border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => reviewSubmission("accept")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={isReviewing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isReviewing ? "Processing..." : "Accept & Award Points"}
                    </Button>
                    <Button
                      onClick={() => reviewSubmission("reject")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={isReviewing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isReviewing ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {submission.feedback && (
              <Card className="surface-elevated border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Admin Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="surface-elevated p-4 rounded border border-border">
                    <p className="text-muted-foreground">{submission.feedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}