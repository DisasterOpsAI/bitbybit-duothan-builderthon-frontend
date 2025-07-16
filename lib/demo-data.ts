// Demo data for testing without Firebase

export const demoTeams = [
  {
    id: 'team-1',
    name: 'CodeMasters',
    email: 'codemasters@example.com',
    totalPoints: 500,
    completedChallenges: ['challenge-1', 'challenge-2'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'team-2',
    name: 'AlgoWarriors',
    email: 'algowarriors@example.com',
    totalPoints: 450,
    completedChallenges: ['challenge-1'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'team-3',
    name: 'BugHunters',
    email: 'bughunters@example.com',
    totalPoints: 300,
    completedChallenges: ['challenge-1'],
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-14')
  }
]

export const demoChallenges = [
  {
    id: 'challenge-1',
    title: 'Array Manipulation Master',
    description: 'Solve array manipulation problems',
    points: 100,
    isActive: true,
    order: 1,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    algorithmicProblem: {
      title: 'Maximum Subarray Sum',
      description: 'Find the maximum sum of any contiguous subarray in the given array.',
      constraints: '1 ≤ array length ≤ 10^5, -10^4 ≤ array[i] ≤ 10^4',
      inputFormat: 'Array of integers',
      outputFormat: 'Single integer (maximum sum)',
      sampleInput: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
      sampleOutput: '6',
      timeLimit: 2,
      memoryLimit: 256
    },
    buildathonProblem: {
      title: 'Array Visualizer',
      description: 'Create a web application that visualizes array algorithms',
      requirements: [
        'Interactive array input interface',
        'Step-by-step algorithm visualization',
        'Responsive design',
        'Clean, modern UI'
      ],
      submissionFormat: 'github',
      allowedTechnologies: ['React', 'Vue', 'Angular', 'Vanilla JS']
    },
    flag: '6'
  },
  {
    id: 'challenge-2',
    title: 'Graph Traversal Challenge',
    description: 'Master graph algorithms',
    points: 200,
    isActive: true,
    order: 2,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    algorithmicProblem: {
      title: 'Shortest Path',
      description: 'Find the shortest path between two nodes in a weighted graph.',
      constraints: '1 ≤ nodes ≤ 1000, 1 ≤ edges ≤ 5000',
      inputFormat: 'Graph representation and start/end nodes',
      outputFormat: 'Shortest distance',
      sampleInput: 'Graph with 4 nodes and weights',
      sampleOutput: '7',
      timeLimit: 3,
      memoryLimit: 512
    },
    buildathonProblem: {
      title: 'Graph Visualizer',
      description: 'Create a graph visualization tool',
      requirements: [
        'Graph drawing interface',
        'Algorithm animation',
        'Multiple graph algorithms',
        'Interactive controls'
      ],
      submissionFormat: 'github',
      allowedTechnologies: ['D3.js', 'Canvas', 'SVG', 'WebGL']
    },
    flag: '7'
  }
]

export const demoSubmissions = [
  {
    id: 'sub-1',
    teamId: 'team-1',
    challengeId: 'challenge-1',
    type: 'algorithmic',
    content: '6',
    status: 'accepted',
    submittedAt: new Date('2024-01-15T10:00:00'),
    evaluatedAt: new Date('2024-01-15T10:01:00')
  },
  {
    id: 'sub-2',
    teamId: 'team-1',
    challengeId: 'challenge-1',
    type: 'buildathon',
    content: 'https://github.com/codemasters/array-visualizer',
    status: 'accepted',
    submittedAt: new Date('2024-01-15T14:00:00'),
    evaluatedAt: new Date('2024-01-15T14:01:00')
  }
]

export const demoProgress = [
  {
    teamId: 'team-1',
    challengeId: 'challenge-1',
    algorithmicCompleted: true,
    buildathonCompleted: true,
    startedAt: new Date('2024-01-15T09:00:00'),
    algorithmicCompletedAt: new Date('2024-01-15T10:00:00'),
    buildathonCompletedAt: new Date('2024-01-15T14:00:00'),
    attempts: 2
  },
  {
    teamId: 'team-2',
    challengeId: 'challenge-1',
    algorithmicCompleted: true,
    buildathonCompleted: false,
    startedAt: new Date('2024-01-14T10:00:00'),
    algorithmicCompletedAt: new Date('2024-01-14T11:00:00'),
    attempts: 1
  }
]

// Demo API functions
export const demoApi = {
  // Get team challenges
  getTeamChallenges: (teamId: string) => {
    return demoChallenges.map(challenge => {
      const progress = demoProgress.find(p => p.teamId === teamId && p.challengeId === challenge.id)
      let status = 'available'
      
      if (progress) {
        if (progress.buildathonCompleted) {
          status = 'completed'
        } else if (progress.algorithmicCompleted) {
          status = 'algorithmic_solved'
        }
      }

      return {
        id: challenge.id,
        title: challenge.title,
        difficulty: challenge.points <= 100 ? 'Easy' : challenge.points <= 200 ? 'Medium' : 'Hard',
        status,
        points: challenge.points,
        timeLimit: `${challenge.algorithmicProblem.timeLimit}s`
      }
    })
  },

  // Get team stats
  getTeamStats: (teamId: string) => {
    const team = demoTeams.find(t => t.id === teamId)
    if (!team) return null

    const allTeamsSorted = [...demoTeams].sort((a, b) => b.totalPoints - a.totalPoints)
    const rank = allTeamsSorted.findIndex(t => t.id === teamId) + 1

    return {
      totalPoints: team.totalPoints,
      challengesCompleted: team.completedChallenges.length,
      currentRank: rank,
      totalTeams: demoTeams.length
    }
  },

  // Get challenge details
  getChallengeDetails: (challengeId: string, teamId?: string) => {
    const challenge = demoChallenges.find(c => c.id === challengeId)
    if (!challenge) return null

    let status = 'available'
    if (teamId) {
      const progress = demoProgress.find(p => p.teamId === teamId && p.challengeId === challengeId)
      if (progress) {
        if (progress.buildathonCompleted) {
          status = 'completed'
        } else if (progress.algorithmicCompleted) {
          status = 'algorithmic_solved'
        }
      }
    }

    return {
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.points <= 100 ? 'Easy' : challenge.points <= 200 ? 'Medium' : 'Hard',
      points: challenge.points,
      status,
      algorithmic: {
        description: challenge.algorithmicProblem.description,
        constraints: challenge.algorithmicProblem.constraints,
        examples: [{
          input: challenge.algorithmicProblem.sampleInput,
          output: challenge.algorithmicProblem.sampleOutput
        }],
        timeLimit: `${challenge.algorithmicProblem.timeLimit} seconds`,
        memoryLimit: `${challenge.algorithmicProblem.memoryLimit} MB`
      },
      buildathon: status !== 'available' ? {
        description: challenge.buildathonProblem.description,
        requirements: challenge.buildathonProblem.requirements,
        deliverables: ['Complete source code on GitHub', 'README with setup instructions']
      } : undefined,
      flag: challenge.flag
    }
  },

  // Get leaderboard
  getLeaderboard: () => {
    return demoTeams
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((team, index) => ({
        rank: index + 1,
        teamName: team.name,
        totalPoints: team.totalPoints,
        challengesCompleted: team.completedChallenges.length,
        lastSubmission: '2 hours ago',
        avatar: '/placeholder.svg?height=40&width=40',
        teamId: team.id
      }))
  },

  // Submit flag
  submitFlag: (challengeId: string, teamId: string, flag: string) => {
    const challenge = demoChallenges.find(c => c.id === challengeId)
    if (!challenge) return { success: false, error: 'Challenge not found' }

    if (flag === challenge.flag) {
      // Update progress
      const progressIndex = demoProgress.findIndex(p => p.teamId === teamId && p.challengeId === challengeId)
      if (progressIndex >= 0) {
        demoProgress[progressIndex].algorithmicCompleted = true
        demoProgress[progressIndex].algorithmicCompletedAt = new Date()
      } else {
        demoProgress.push({
          teamId,
          challengeId,
          algorithmicCompleted: true,
          buildathonCompleted: false,
          startedAt: new Date(),
          algorithmicCompletedAt: new Date(),
          attempts: 1
        })
      }
      
      return { success: true, message: 'Flag accepted! Buildathon challenge unlocked.' }
    } else {
      return { success: false, error: 'Invalid flag' }
    }
  }
}