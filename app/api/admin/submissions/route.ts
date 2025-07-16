import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const submissionsSnapshot = await adminDb.collection('submissions').get()
    
    const submissions = []
    
    for (const submissionDoc of submissionsSnapshot.docs) {
      const submissionData = submissionDoc.data()
      
      // Get team name
      const teamDoc = await adminDb.collection('teams').doc(submissionData.teamId).get()
      const teamName = teamDoc.exists ? teamDoc.data()?.name : 'Unknown Team'
      
      // Get challenge title
      const challengeDoc = await adminDb.collection('challenges').doc(submissionData.challengeId).get()
      const challengeData = challengeDoc.exists ? challengeDoc.data() : null
      
      submissions.push({
        id: submissionDoc.id,
        teamName,
        challengeTitle: challengeData?.title || 'Unknown Challenge',
        challengeType: challengeData?.type || 'algorithmic',
        status: submissionData.status || 'pending',
        submittedAt: submissionData.submittedAt.toDate().toISOString(),
        language: submissionData.language,
        githubLink: submissionData.githubLink,
        points: challengeData?.points || 0
      })
    }
    
    // Sort submissions by submission date (newest first)
    submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})