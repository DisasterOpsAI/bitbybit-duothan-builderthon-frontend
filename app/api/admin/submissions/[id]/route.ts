import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

export const GET = requireAdmin(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const submissionId = params.id

    // Get submission from Firebase
    const submissionDoc = await adminDb.collection('submissions').doc(submissionId).get()
    
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const submissionData = submissionDoc.data()
    
    // Get team info
    let teamName = 'Unknown Team'
    try {
      const teamDoc = await adminDb.collection('teams').doc(submissionData.teamId).get()
      if (teamDoc.exists) {
        teamName = teamDoc.data()?.name || 'Unknown Team'
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    }
    
    // Get challenge info
    let challengeTitle = 'Unknown Challenge'
    let challengePoints = 0
    try {
      const challengeDoc = await adminDb.collection('challenges').doc(submissionData.challengeId).get()
      if (challengeDoc.exists) {
        const challengeData = challengeDoc.data()
        challengeTitle = challengeData?.title || 'Unknown Challenge'
        challengePoints = challengeData?.points || 0
      }
    } catch (error) {
      console.error('Error fetching challenge:', error)
    }

    const submission = {
      id: submissionDoc.id,
      teamId: submissionData.teamId,
      teamName,
      challengeId: submissionData.challengeId,
      challengeTitle,
      type: submissionData.type,
      content: submissionData.content,
      status: submissionData.status,
      submittedAt: submissionData.submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      points: challengePoints,
      feedback: submissionData.feedback || null
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Failed to fetch submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})