import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Get all teams with their points
    const teamsSnapshot = await adminDb
      .collection('teams')
      .orderBy('totalPoints', 'desc')
      .orderBy('updatedAt', 'asc') // Secondary sort by time for tie-breaking
      .get()

    const leaderboard = []
    let rank = 1

    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data()
      
      // Get completed challenges count
      const challengesCompleted = teamData.completedChallenges?.length || 0
      
      // Get last submission time
      let lastSubmission = "No submissions"
      try {
        const lastSubmissionSnapshot = await adminDb
          .collection('submissions')
          .where('teamId', '==', teamDoc.id)
          .orderBy('submittedAt', 'desc')
          .limit(1)
          .get()

        if (!lastSubmissionSnapshot.empty) {
          const lastSubmissionData = lastSubmissionSnapshot.docs[0].data()
          lastSubmission = formatRelativeTime(lastSubmissionData.submittedAt.toDate())
        }
      } catch (error) {
        // If error getting last submission, use team update time
        if (teamData.updatedAt) {
          lastSubmission = formatRelativeTime(teamData.updatedAt.toDate())
        }
      }

      leaderboard.push({
        rank,
        teamName: teamData.name,
        totalPoints: teamData.totalPoints || 0,
        challengesCompleted,
        lastSubmission,
        avatar: "/placeholder.svg?height=40&width=40",
        teamId: teamDoc.id
      })

      rank++
    }

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
