"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"
import { useRouter } from "next/navigation"

interface Example {
  input: string
  output: string
}

interface ChallengeData {
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  status: "draft" | "active"
  algorithmic: {
    description: string
    constraints: string
    examples: Example[]
    timeLimit: string
    memoryLimit: string
  }
  buildathon: {
    description: string
    requirements: string[]
    deliverables: string[]
  }
  flag: string
}

export default function CreateChallengePage() {
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    title: '',
    difficulty: 'Easy',
    points: 100,
    status: 'draft',
    algorithmic: {
      description: '',
      constraints: '',
      examples: [{ input: '', output: '' }],
      timeLimit: '2 seconds',
      memoryLimit: '256 MB'
    },
    buildathon: {
      description: '',
      requirements: [''],
      deliverables: ['']
    },
    flag: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const addExample = () => {
    setChallengeData(prev => ({
      ...prev,
      algorithmic: {
        ...prev.algorithmic,
        examples: [...prev.algorithmic.examples, { input: '', output: '' }]
      }
    }))
  }

  const removeExample = (index: number) => {
    setChallengeData(prev => ({
      ...prev,
      algorithmic: {
        ...prev.algorithmic,
        examples: prev.algorithmic.examples.filter((_, i) => i !== index)
      }
    }))
  }

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    setChallengeData(prev => ({
      ...prev,
      algorithmic: {
        ...prev.algorithmic,
        examples: prev.algorithmic.examples.map((example, i) =>
          i === index ? { ...example, [field]: value } : example
        )
      }
    }))
  }

  const addRequirement = () => {
    setChallengeData(prev => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        requirements: [...prev.buildathon.requirements, '']
      }
    }))
  }

  const removeRequirement = (index: number) => {
    setChallengeData(prev => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        requirements: prev.buildathon.requirements.filter((_, i) => i !== index)
      }
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setChallengeData(prev => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        requirements: prev.buildathon.requirements.map((req, i) =>
          i === index ? value : req
        )
      }
    }))
  }

  const addDeliverable = () => {
    setChallengeData(prev => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        deliverables: [...prev.buildathon.deliverables, '']
      }
    }))
  }

  const removeDeliverable = (index: number) => {
    setChallengeData(prev => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        deliverables: prev.buildathon.deliverables.filter((_, i) => i !== index)
      }
    }))
  }

  const updateDeliverable = (index: number, value: string) => {
    setChallengeData(prev => ({
      ...prev,
      buildathon: {
        ...prev.buildathon,
        deliverables: prev.buildathon.deliverables.map((del, i) =>
          i === index ? value : del
        )
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!challengeData.title.trim()) {
      setError('Challenge title is required')
      return
    }

    if (!challengeData.algorithmic.description.trim()) {
      setError('Algorithmic problem description is required')
      return
    }

    if (!challengeData.buildathon.description.trim()) {
      setError('Buildathon problem description is required')
      return
    }

    if (!challengeData.flag.trim()) {
      setError('Flag is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // TODO: Backend Integration Point 12
      // Create new challenge
      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(challengeData)
      })

      if (response.ok) {
        setSuccess('Challenge created successfully!')
        setTimeout(() => {
          router.push('/admin/challenges')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create challenge')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen oasis-bg">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Challenge</h1>
          <p className="text-white/70">
            Design a comprehensive challenge with algorithmic and buildathon components
          </p>
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

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="bg-black/40 border-white/20">
              <TabsTrigger value="basic" className="text-white">Basic Info</TabsTrigger>
              <TabsTrigger value="algorithmic" className="text-white">Algorithmic Problem</TabsTrigger>
              <TabsTrigger value="buildathon" className="text-white">Buildathon Problem</TabsTrigger>
              <TabsTrigger value="flag" className="text-white">Flag & Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Challenge Information</CardTitle>
                  <CardDescription className="text-white/70">
                    Basic details about your challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Challenge Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter challenge title"
                      value={challengeData.title}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                      <Select 
                        value={challengeData.difficulty} 
                        onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                          setChallengeData(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          <SelectItem value="Easy" className="text-white">Easy</SelectItem>
                          <SelectItem value="Medium" className="text-white">Medium</SelectItem>
                          <SelectItem value="Hard" className="text-white">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="points" className="text-white">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={challengeData.points}
                        onChange={(e) => setChallengeData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-white">Status</Label>
                      <Select 
                        value={challengeData.status} 
                        onValueChange={(value: 'draft' | 'active') => 
                          setChallengeData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          <SelectItem value="draft" className="text-white">Draft</SelectItem>
                          <SelectItem value="active" className="text-white">Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Algorithmic Problem */}
            <TabsContent value="algorithmic" className="space-y-6">
              <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Algorithmic Problem</CardTitle>
                  <CardDescription className="text-white/70">
                    Define the coding challenge portion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="algo-description" className="text-white">Problem Description</Label>
                    <textarea
                      id="algo-description"
                      placeholder="Describe the algorithmic problem..."
                      value={challengeData.algorithmic.description}
                      onChange={(e) => setChallengeData(prev => ({
                        ...prev,
                        algorithmic: { ...prev.algorithmic, description: e.target.value }
                      }))}
                      className="w-full min-h-32 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 resize-y"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="constraints" className="text-white">Constraints</Label>
                    <textarea
                      id="constraints"
                      placeholder="Input constraints and limits..."
                      value={challengeData.algorithmic.constraints}
                      onChange={(e) => setChallengeData(prev => ({
                        ...prev,
                        algorithmic: { ...prev.algorithmic, constraints: e.target.value }
                      }))}
                      className="w-full min-h-24 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 resize-y"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time-limit" className="text-white">Time Limit</Label>
                      <Input
                        id="time-limit"
                        type="text"
                        placeholder="2 seconds"
                        value={challengeData.algorithmic.timeLimit}
                        onChange={(e) => setChallengeData(prev => ({
                          ...prev,
                          algorithmic: { ...prev.algorithmic, timeLimit: e.target.value }
                        }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="memory-limit" className="text-white">Memory Limit</Label>
                      <Input
                        id="memory-limit"
                        type="text"
                        placeholder="256 MB"
                        value={challengeData.algorithmic.memoryLimit}
                        onChange={(e) => setChallengeData(prev => ({
                          ...prev,
                          algorithmic: { ...prev.algorithmic, memoryLimit: e.target.value }
                        }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Examples</Label>
                      <button
                        type="button"
                        onClick={addExample}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add Example
                      </button>
                    </div>

                    {challengeData.algorithmic.examples.map((example, index) => (
                      <div key={index} className="border border-white/20 rounded p-4 mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">Example {index + 1}</span>
                          {challengeData.algorithmic.examples.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExample(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Input</Label>
                            <textarea
                              placeholder="Example input..."
                              value={example.input}
                              onChange={(e) => updateExample(index, 'input', e.target.value)}
                              className="w-full min-h-20 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/50 resize-y"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-white">Output</Label>
                            <textarea
                              placeholder="Expected output..."
                              value={example.output}
                              onChange={(e) => updateExample(index, 'output', e.target.value)}
                              className="w-full min-h-20 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/50 resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Buildathon Problem */}
            <TabsContent value="buildathon" className="space-y-6">
              <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Buildathon Problem</CardTitle>
                  <CardDescription className="text-white/70">
                    Define the project building challenge
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="build-description" className="text-white">Project Description</Label>
                    <textarea
                      id="build-description"
                      placeholder="Describe the buildathon project..."
                      value={challengeData.buildathon.description}
                      onChange={(e) => setChallengeData(prev => ({
                        ...prev,
                        buildathon: { ...prev.buildathon, description: e.target.value }
                      }))}
                      className="w-full min-h-32 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 resize-y"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Requirements</Label>
                      <button
                        type="button"
                        onClick={addRequirement}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add Requirement
                      </button>
                    </div>

                    {challengeData.buildathon.requirements.map((requirement, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Enter requirement..."
                          value={requirement}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        {challengeData.buildathon.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="px-3 py-2 text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Deliverables</Label>
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Add Deliverable
                      </button>
                    </div>

                    {challengeData.buildathon.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Enter deliverable..."
                          value={deliverable}
                          onChange={(e) => updateDeliverable(index, e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        {challengeData.buildathon.deliverables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDeliverable(index)}
                            className="px-3 py-2 text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flag & Settings */}
            <TabsContent value="flag" className="space-y-6">
              <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Flag & Final Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Set the challenge flag and finalize settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="flag" className="text-white">Challenge Flag</Label>
                    <Input
                      id="flag"
                      type="text"
                      placeholder="flag{example_flag_here}"
                      value={challengeData.flag}
                      onChange={(e) => setChallengeData(prev => ({ ...prev, flag: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.push('/admin/challenges')}
                      className="px-6 py-2 border border-white/20 text-white rounded hover:bg-white/10"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Challenge'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}
