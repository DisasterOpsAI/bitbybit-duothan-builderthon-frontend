"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Play, Flag, Upload, CheckCircle, AlertCircle, Clock, Trophy } from "lucide-react"
import { TeamNavbar } from "@/components/team-navbar"

interface Challenge {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  status: "available" | "algorithmic_solved" | "completed"
  algorithmic: {
    description: string
    constraints: string
    examples: Array<{ input: string; output: string }>
    timeLimit: string
    memoryLimit: string
  }
  buildathon?: {
    description: string
    requirements: string[]
    deliverables: string[]
  }
  flag: string
}

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", judge0Id: 63 },
  { id: "python", name: "Python 3", judge0Id: 71 },
  { id: "java", name: "Java", judge0Id: 62 },
  { id: "cpp", name: "C++", judge0Id: 54 },
  { id: "c", name: "C", judge0Id: 50 },
]

export default function ChallengePage() {
  const params = useParams()
  const challengeId = params.id as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("python")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [flagInput, setFlagInput] = useState("")
  const [githubLink, setGithubLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchChallenge()
  }, [challengeId])

  const fetchChallenge = async () => {
    try {
      // TODO: Backend Integration Point 4
      // Fetch challenge details
      const response = await fetch(`/api/challenges/${challengeId}`)
      if (response.ok) {
        const data = await response.json()
        setChallenge(data)
      }
    } catch (error) {
      console.error("Failed to fetch challenge:", error)
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to run")
      return
    }

    setIsRunning(true)
    setError("")
    setOutput("")

    try {
      const selectedLang = LANGUAGES.find((l) => l.id === language)

      // TODO: Backend Integration Point 5
      // Execute code using Judge0 API
      const response = await fetch("/api/judge0/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: selectedLang?.judge0Id,
          stdin: "",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setOutput(result.stdout || result.stderr || "No output")
      } else {
        setError("Failed to execute code")
      }
    } catch (err) {
      setError("Network error during code execution")
    } finally {
      setIsRunning(false)
    }
  }

  const submitFlag = async () => {
    if (!flagInput.trim()) {
      setError("Please enter the flag")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // TODO: Backend Integration Point 6
      // Submit flag for validation
      const response = await fetch(`/api/challenges/${challengeId}/submit-flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: flagInput.trim() }),
      })

      if (response.ok) {
        setSuccess("Flag accepted! Buildathon challenge unlocked.")
        setChallenge((prev) => (prev ? { ...prev, status: "algorithmic_solved" } : null))
        setFlagInput("")
      } else {
        const data = await response.json()
        setError(data.error || "Invalid flag")
      }
    } catch (err) {
      setError("Network error during flag submission")
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitBuildathon = async () => {
    if (!githubLink.trim()) {
      setError("Please enter your GitHub repository link")
      return
    }

    if (!githubLink.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // TODO: Backend Integration Point 7
      // Submit buildathon solution
      const response = await fetch(`/api/challenges/${challengeId}/submit-buildathon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubLink: githubLink.trim() }),
      })

      if (response.ok) {
        setSuccess("Buildathon submission successful! Challenge completed.")
        setChallenge((prev) => (prev ? { ...prev, status: "completed" } : null))
        setGithubLink("")
      } else {
        const data = await response.json()
        setError(data.error || "Submission failed")
      }
    } catch (err) {
      setError("Network error during submission")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!challenge) {
    return (
      <div className="min-h-screen oasis-bg">
        <TeamNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-white text-xl">Loading challenge...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen oasis-bg">
      <TeamNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Challenge Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{challenge.title}</h1>
              <p className="text-white/70">
                {challenge.status === "available" && "Solve the algorithmic challenge to unlock buildathon"}
                {challenge.status === "algorithmic_solved" && "Algorithmic solved! Complete the buildathon challenge"}
                {challenge.status === "completed" && "Challenge completed successfully"}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge
                className={
                  challenge.difficulty === "Easy"
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : challenge.difficulty === "Medium"
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                }
              >
                {challenge.difficulty}
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <Trophy className="w-3 h-3 mr-1" />
                {challenge.points} pts
              </Badge>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 mb-6">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="algorithmic" className="space-y-6">
          <TabsList className="bg-black/40 border-white/20">
            <TabsTrigger value="algorithmic" className="text-white">
              <Code className="w-4 h-4 mr-2" />
              Algorithmic Challenge
            </TabsTrigger>
            <TabsTrigger value="buildathon" className="text-white" disabled={challenge.status === "available"}>
              <Upload className="w-4 h-4 mr-2" />
              Buildathon Challenge
              {challenge.status === "available" && (
                <Badge className="ml-2 bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">Locked</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Algorithmic Challenge Tab */}
          <TabsContent value="algorithmic" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Problem Description */}
              <div className="space-y-6">
                <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Problem Statement</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-4">
                    <div dangerouslySetInnerHTML={{ __html: challenge.algorithmic.description }} />
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Constraints & Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/80 space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-400" />
                        <span>Time: {challenge.algorithmic.timeLimit}</span>
                      </div>
                      <div className="flex items-center">
                        <Code className="w-4 h-4 mr-2 text-green-400" />
                        <span>Memory: {challenge.algorithmic.memoryLimit}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div dangerouslySetInnerHTML={{ __html: challenge.algorithmic.constraints }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Examples</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {challenge.algorithmic.examples.map((example, index) => (
                      <div key={index} className="space-y-2">
                        <div className="text-white font-semibold">Example {index + 1}:</div>
                        <div className="bg-black/60 p-3 rounded border border-white/10">
                          <div className="text-green-400 text-sm mb-1">Input:</div>
                          <pre className="text-white/80 text-sm">{example.input}</pre>
                        </div>
                        <div className="bg-black/60 p-3 rounded border border-white/10">
                          <div className="text-blue-400 text-sm mb-1">Output:</div>
                          <pre className="text-white/80 text-sm">{example.output}</pre>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Flag Submission */}
                {challenge.status === "available" && (
                  <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Flag className="w-5 h-5 mr-2 text-yellow-400" />
                        Submit Flag
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        Enter the correct output as the flag to unlock the buildathon challenge
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="flag" className="text-white">
                          Flag
                        </Label>
                        <Input
                          id="flag"
                          type="text"
                          placeholder="Enter your flag here"
                          value={flagInput}
                          onChange={(e) => setFlagInput(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <Button
                        onClick={submitFlag}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Validating..." : "Submit Flag"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Code Editor */}
              <div className="space-y-6">
                <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Code Editor</CardTitle>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="language" className="text-white text-sm">
                          Language
                        </Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.id} value={lang.id} className="text-white hover:bg-white/10">
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={runCode}
                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        disabled={isRunning}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunning ? "Running..." : "Run Code"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="min-h-[400px] bg-black/60 border-white/20 text-white font-mono text-sm placeholder:text-white/50"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/60 p-4 rounded border border-white/10 min-h-[200px]">
                      <pre className="text-green-400 text-sm whitespace-pre-wrap">
                        {output || "Run your code to see the output here..."}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Buildathon Challenge Tab */}
          <TabsContent value="buildathon" className="space-y-6">
            {challenge.buildathon && (
              <div className="space-y-6">
                <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Buildathon Challenge</CardTitle>
                    <CardDescription className="text-white/70">
                      Create an innovative solution and submit your GitHub repository
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-3">Project Description</h3>
                      <div
                        className="text-white/80"
                        dangerouslySetInnerHTML={{ __html: challenge.buildathon.description }}
                      />
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-3">Requirements</h3>
                      <ul className="text-white/80 space-y-2">
                        {challenge.buildathon.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-3">Deliverables</h3>
                      <ul className="text-white/80 space-y-2">
                        {challenge.buildathon.deliverables.map((deliverable, index) => (
                          <li key={index} className="flex items-start">
                            <Upload className="w-4 h-4 mr-2 text-blue-400 mt-0.5 flex-shrink-0" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {challenge.status !== "completed" && (
                  <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Submit Your Solution</CardTitle>
                      <CardDescription className="text-white/70">
                        Upload your project to GitHub and submit the repository link
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="github" className="text-white">
                          GitHub Repository URL
                        </Label>
                        <Input
                          id="github"
                          type="url"
                          placeholder="https://github.com/username/repository"
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <Button
                        onClick={submitBuildathon}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Buildathon Solution"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {challenge.status === "completed" && (
                  <Card className="bg-green-500/10 border-green-500/30 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Challenge Completed!</h3>
                        <p className="text-green-300">
                          Congratulations! You have successfully completed both the algorithmic and buildathon
                          challenges.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
