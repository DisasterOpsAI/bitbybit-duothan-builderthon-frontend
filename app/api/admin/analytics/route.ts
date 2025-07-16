import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || 'all'
    
    // Calculate date filter
    let dateFilter = new Date(0) // Beginning of time
    const now = new Date()
    
    switch (timeRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }
    
    // Fetch all data
    const [teamsSnapshot, challengesSnapshot, submissionsSnapshot] = await Promise.all([
      adminDb.collection('teams').get(),
      adminDb.collection('challenges').get(),
      adminDb.collection('submissions').get()
    ])
    
    // Filter submissions by date
    const filteredSubmissions = submissionsSnapshot.docs.filter(doc => {
      const submissionDate = doc.data().submittedAt.toDate()
      return submissionDate >= dateFilter
    })
    
    const totalTeams = teamsSnapshot.size
    const totalSubmissions = filteredSubmissions.length
    
    // Calculate average score and completion rate
    const acceptedSubmissions = filteredSubmissions.filter(doc => doc.data().status === 'accepted')
    const completionRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0
    
    // Calculate average score based on challenge points
    let totalPossiblePoints = 0
    let totalEarnedPoints = 0
    
    for (const submission of filteredSubmissions) {
      const challengeId = submission.data().challengeId
      const challenge = challengesSnapshot.docs.find(doc => doc.id === challengeId)
      if (challenge) {
        const points = challenge.data().points || 100
        totalPossiblePoints += points
        if (submission.data().status === 'accepted') {
          totalEarnedPoints += points
        }
      }
    }
    
    const averageScore = totalPossiblePoints > 0 ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100) : 0
    
    // Challenge stats
    const challengeStats = []
    for (const challengeDoc of challengesSnapshot.docs) {
      const challengeData = challengeDoc.data()
      const challengeSubmissions = filteredSubmissions.filter(doc => doc.data().challengeId === challengeDoc.id)
      const challengeAccepted = challengeSubmissions.filter(doc => doc.data().status === 'accepted')
      
      if (challengeSubmissions.length > 0) {
        challengeStats.push({
          challengeId: challengeDoc.id,
          title: challengeData.title,
          type: challengeData.type,
          totalSubmissions: challengeSubmissions.length,
          acceptedSubmissions: challengeAccepted.length,
          averageAttempts: Math.round(challengeSubmissions.length / Math.max(1, challengeAccepted.length)),
          difficulty: challengeData.difficulty || 'medium'
        })
      }
    }
    
    // Team performance
    const teamPerformance = []
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data()
      const teamSubmissions = filteredSubmissions.filter(doc => doc.data().teamId === teamDoc.id)
      const teamAccepted = teamSubmissions.filter(doc => doc.data().status === 'accepted')
      
      let teamPoints = 0
      for (const submission of teamAccepted) {
        const challengeId = submission.data().challengeId
        const challenge = challengesSnapshot.docs.find(doc => doc.id === challengeId)
        if (challenge) {
          teamPoints += challenge.data().points || 100
        }
      }
      
      teamPerformance.push({
        teamId: teamDoc.id,
        name: teamData.name,
        totalPoints: teamPoints,
        completedChallenges: teamAccepted.length,
        averageScore: teamSubmissions.length > 0 ? Math.round((teamAccepted.length / teamSubmissions.length) * 100) : 0,
        rank: 0 // Will be calculated after sorting
      })
    }
    
    // Sort and rank teams
    teamPerformance.sort((a, b) => b.totalPoints - a.totalPoints)
    teamPerformance.forEach((team, index) => {
      team.rank = index + 1
    })
    
    // Language distribution
    const languageCount = {}
    filteredSubmissions.forEach(doc => {
      const language = doc.data().language
      if (language) {
        languageCount[language] = (languageCount[language] || 0) + 1
      }
    })
    
    const languageDistribution = Object.entries(languageCount)
      .map(([language, count]) => ({
        language,
        count: count as number,
        percentage: Math.round((count as number / Math.max(1, totalSubmissions)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    // Submission trends (last 30 days)
    const submissionTrends = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySubmissions = filteredSubmissions.filter(doc => {
        const submissionDate = doc.data().submittedAt.toDate()
        return submissionDate.toISOString().split('T')[0] === dateStr
      })
      
      const algorithmicSubmissions = daySubmissions.filter(doc => {
        const challengeId = doc.data().challengeId
        const challenge = challengesSnapshot.docs.find(c => c.id === challengeId)
        return challenge && challenge.data().type === 'algorithmic'
      }).length
      
      const buildathonSubmissions = daySubmissions.filter(doc => {
        const challengeId = doc.data().challengeId
        const challenge = challengesSnapshot.docs.find(c => c.id === challengeId)
        return challenge && challenge.data().type === 'buildathon'
      }).length
      
      submissionTrends.push({
        date: dateStr,
        algorithmicSubmissions,
        buildathonSubmissions,
        totalSubmissions: daySubmissions.length
      })
    }
    
    const analyticsData = {
      totalTeams,
      totalSubmissions,
      averageScore,
      completionRate,
      challengeStats,
      teamPerformance,
      submissionTrends,
      languageDistribution
    }
    
    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})