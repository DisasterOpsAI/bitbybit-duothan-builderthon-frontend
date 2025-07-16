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
      status: 'accepted', // Auto-accept for now, could add manual review later
      submittedAt: new Date(),
      evaluatedAt: new Date()
    }

    await adminDb.collection('submissions').add(submission)

    // Update team progress
    const progressDoc = progressQuery.docs[0]
    await progressDoc.ref.update({
      buildathonCompleted: true,
      buildathonCompletedAt: new Date()
    })

    // Update team total points
    const challengeDoc = await adminDb.collection('challenges').doc(challengeId).get()
    const challengeData = challengeDoc.data()
    const points = challengeData?.points || 0

    const teamDoc = await adminDb.collection('teams').doc(teamId).get()
    if (teamDoc.exists) {
      const currentPoints = teamDoc.data()?.totalPoints || 0
      const { FieldValue } = await import('firebase-admin/firestore')
      await teamDoc.ref.update({
        totalPoints: currentPoints + points,
        completedChallenges: FieldValue.arrayUnion(challengeId),
        updatedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: "Buildathon submission successful! Challenge completed.",
      pointsEarned: points
    })
  } catch (error) {
    console.error("Buildathon submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
