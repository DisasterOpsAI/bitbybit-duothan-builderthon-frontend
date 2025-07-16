import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const teamsSnapshot = await adminDb.collection('teams').get()
    const submissionsSnapshot = await adminDb.collection('submissions').get()
    
    const teams = []
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data()
      
      // Get team submissions
      const teamSubmissions = submissionsSnapshot.docs.filter(doc => 
        doc.data().teamId === teamDoc.id
      )
      
      // Calculate completed challenges
      const completedChallenges = teamSubmissions.filter(submission => 
        submission.data().status === 'accepted'
      ).length
      
      // Get last activity
      const lastSubmission = teamSubmissions
        .sort((a, b) => b.data().submittedAt.toDate() - a.data().submittedAt.toDate())[0]
      
      const lastActivity = lastSubmission 
        ? formatRelativeTime(lastSubmission.data().submittedAt.toDate())
        : 'No activity'
      
      teams.push({
        id: teamDoc.id,
        name: teamData.name,
        members: teamData.members || [],
        createdAt: teamData.createdAt.toDate().toISOString(),
        totalPoints: teamData.totalPoints || 0,
        completedChallenges,
        lastActivity
      })
    }
    
    // Sort teams by total points (descending)
    teams.sort((a, b) => b.totalPoints - a.totalPoints)
    
    return NextResponse.json({ teams })
  } catch (error) {
    console.error("Failed to fetch teams:", error)
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