import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Submission } from "@/lib/database-schema"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = params.id
    const { githubLink } = await request.json()
    const teamId = request.headers.get('x-team-id')

    if (!teamId) {
      return NextResponse.json({ error: "Team authentication required" }, { status: 401 })
    }

    if (!githubLink || !githubLink.includes("github.com")) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 })
    }

    // Check if team has completed algorithmic part
    const progressQuery = await adminDb
      .collection('team_progress')
      .where('teamId', '==', teamId)
      .where('challengeId', '==', challengeId)
      .get()

    if (progressQuery.empty || !progressQuery.docs[0].data().algorithmicCompleted) {
      return NextResponse.json({ error: "Must complete algorithmic challenge first" }, { status: 403 })
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/
    if (!githubUrlPattern.test(githubLink.trim())) {
      return NextResponse.json({ error: "Please provide a valid GitHub repository URL" }, { status: 400 })
    }

    // Create buildathon submission
    const submission: Omit<Submission, 'id'> = {
      teamId,
      challengeId,
      type: 'buildathon',
      content: githubLink.trim(),
      status: 'pending', // Set to pending for admin review
      submittedAt: new Date()
    }

    const submissionRef = await adminDb.collection('submissions').add(submission)
    
    // Get team details for notification
    const teamDoc = await adminDb.collection('teams').doc(teamId).get()
    const teamData = teamDoc.data()
    
    // Get challenge details for notification
    const challengeDoc = await adminDb.collection('challenges').doc(challengeId).get()
    const challengeData = challengeDoc.data()
    
    // Create admin notification for buildathon submission
    const notification = {
      type: 'buildathon_submission',
      submissionId: submissionRef.id,
      teamId,
      teamName: teamData?.name || 'Unknown Team',
      challengeId,
      challengeTitle: challengeData?.title || 'Unknown Challenge',
      githubLink: githubLink.trim(),
      submittedAt: new Date(),
      isRead: false,
      priority: 'normal'
    }
    
    await adminDb.collection('admin_notifications').add(notification)

    // Update team progress to mark buildathon as submitted but not completed
    const progressDoc = progressQuery.docs[0]
    await progressDoc.ref.update({
      buildathonSubmitted: true,
      buildathonSubmittedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Buildathon submission successful! Your submission is now under review by the admin team.",
      submissionId: submissionRef.id,
      status: 'pending'
    })
  } catch (error) {
    console.error("Buildathon submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
