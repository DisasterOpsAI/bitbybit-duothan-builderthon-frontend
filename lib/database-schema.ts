// Database Schema Types and Interfaces

export interface Team {
  id: string
  name: string
  email: string
  authProvider: 'google' | 'github'
  authId: string
  createdAt: Date
  updatedAt: Date
  totalPoints: number
  currentChallengeId?: string
  completedChallenges: string[]
}

export interface Challenge {
  id: string
  title: string
  description: string
  points: number
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  algorithmicProblem: AlgorithmicProblem
  buildathonProblem: BuildathonProblem
  flag: string
}

export interface AlgorithmicProblem {
  title: string
  description: string
  constraints: string
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  timeLimit: number
  memoryLimit: number
}

export interface BuildathonProblem {
  title: string
  description: string
  requirements: string[]
  submissionFormat: 'github' | 'zip'
  allowedTechnologies?: string[]
}

export interface Submission {
  id: string
  teamId: string
  challengeId: string
  type: 'algorithmic' | 'buildathon'
  content: string // Code for algorithmic, GitHub URL for buildathon
  language?: string // For algorithmic submissions
  status: 'pending' | 'accepted' | 'rejected' | 'runtime_error' | 'compilation_error'
  executionTime?: number
  memoryUsage?: number
  output?: string
  error?: string
  submittedAt: Date
  evaluatedAt?: Date
}

export interface AdminUser {
  id: string
  email: string
  passwordHash: string
  role: 'admin'
  createdAt: Date
  lastLoginAt?: Date
}

export interface TeamProgress {
  teamId: string
  challengeId: string
  algorithmicCompleted: boolean
  buildathonCompleted: boolean
  buildathonSubmitted?: boolean
  startedAt: Date
  algorithmicCompletedAt?: Date
  buildathonCompletedAt?: Date
  buildathonSubmittedAt?: Date
  attempts: number
}

export interface AdminNotification {
  id: string
  type: 'buildathon_submission' | 'system_alert' | 'team_registration'
  submissionId?: string
  teamId: string
  teamName: string
  challengeId?: string
  challengeTitle?: string
  githubLink?: string
  submittedAt: Date
  isRead: boolean
  priority: 'low' | 'normal' | 'high'
  message?: string
}