import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Fetch real-time statistics from Firebase
    const [teamsSnapshot, challengesSnapshot, submissionsSnapshot] = await Promise.all([
      adminDb.collection('teams').get(),
      adminDb.collection('challenges').get(),
      adminDb.collection('submissions').get()
    ])

    const totalTeams = teamsSnapshot.size
    const activeChallenges = challengesSnapshot.docs.filter(doc => doc.data().isActive).length
    const totalSubmissions = submissionsSnapshot.size
    
    // Calculate completed challenges
    const completedChallenges = submissionsSnapshot.docs.filter(doc => 
      doc.data().status === 'accepted' && doc.data().type === 'buildathon'
    ).length

    // Get recent activity
    const recentActivity = []
    
    // Get recent team registrations
    const recentTeams = teamsSnapshot.docs
      .sort((a, b) => b.data().createdAt.toDate() - a.data().createdAt.toDate())
      .slice(0, 3)
    
    for (const team of recentTeams) {
      const teamData = team.data()
      recentActivity.push({
        id: team.id,
        type: "registration",
        teamName: teamData.name,
        timestamp: formatRelativeTime(teamData.createdAt.toDate())
      })
    }

    // Get recent submissions
    const recentSubmissions = submissionsSnapshot.docs
      .sort((a, b) => b.data().submittedAt.toDate() - a.data().submittedAt.toDate())
      .slice(0, 2)
    
    for (const submission of recentSubmissions) {
      const submissionData = submission.data()
      const teamDoc = await adminDb.collection('teams').doc(submissionData.teamId).get()
      const challengeDoc = await adminDb.collection('challenges').doc(submissionData.challengeId).get()
      
      if (teamDoc.exists && challengeDoc.exists) {
        recentActivity.push({
          id: submission.id,
          type: submissionData.status === 'accepted' ? "completion" : "submission",
          teamName: teamDoc.data()?.name || 'Unknown Team',
          challengeTitle: challengeDoc.data()?.title || 'Unknown Challenge',
          timestamp: formatRelativeTime(submissionData.submittedAt.toDate())
        })
      }
    }

    // Sort activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Get leaderboard snapshot
    const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const leaderboardSnapshot = teams
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 5)
      .map((team, index) => ({
        rank: index + 1,
        teamName: team.name,
        points: team.totalPoints || 0
      }))

    const dashboardStats = {
      totalTeams,
      activeChallenges,
      totalSubmissions,
      completedChallenges,
      recentActivity: recentActivity.slice(0, 5),
      leaderboardSnapshot
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}
