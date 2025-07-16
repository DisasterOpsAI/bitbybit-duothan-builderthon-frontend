import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Submission, TeamProgress } from "@/lib/database-schema"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = params.id
    const { flag } = await request.json()
    const teamId = request.headers.get('x-team-id')

    if (!teamId) {
      return NextResponse.json({ error: "Team authentication required" }, { status: 401 })
    }

    if (!flag || !flag.trim()) {
      return NextResponse.json({ error: "Flag is required" }, { status: 400 })
    }

    // Get challenge to verify flag
    const challengeDoc = await adminDb.collection('challenges').doc(challengeId).get()
    
    if (!challengeDoc.exists) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    const challengeData = challengeDoc.data()
    const correctFlag = challengeData?.flag

    if (flag.trim() === correctFlag) {
      // Create algorithmic submission
      const submission: Omit<Submission, 'id'> = {
        teamId,
        challengeId,
        type: 'algorithmic',
        content: flag.trim(),
        status: 'accepted',
        submittedAt: new Date(),
        evaluatedAt: new Date()
      }

      await adminDb.collection('submissions').add(submission)

      // Update or create team progress
      const progressQuery = await adminDb
        .collection('team_progress')
        .where('teamId', '==', teamId)
        .where('challengeId', '==', challengeId)
        .get()

      if (progressQuery.empty) {
        // Create new progress record
        const newProgress: Omit<TeamProgress, 'teamId' | 'challengeId'> = {
          algorithmicCompleted: true,
          buildathonCompleted: false,
          startedAt: new Date(),
          algorithmicCompletedAt: new Date(),
          attempts: 1
        }

        await adminDb.collection('team_progress').add({
          teamId,
          challengeId,
          ...newProgress
        })
      } else {
        // Update existing progress
        const progressDoc = progressQuery.docs[0]
        await progressDoc.ref.update({
          algorithmicCompleted: true,
          algorithmicCompletedAt: new Date(),
          attempts: (progressDoc.data().attempts || 0) + 1
        })
      }

      return NextResponse.json({
        success: true,
        message: "Flag accepted! Buildathon challenge unlocked.",
      })
    } else {
      // Record failed attempt
      const submission: Omit<Submission, 'id'> = {
        teamId,
        challengeId,
        type: 'algorithmic',
        content: flag.trim(),
        status: 'rejected',
        submittedAt: new Date(),
        evaluatedAt: new Date()
      }

      await adminDb.collection('submissions').add(submission)

      // Update attempts count
      const progressQuery = await adminDb
        .collection('team_progress')
        .where('teamId', '==', teamId)
        .where('challengeId', '==', challengeId)
        .get()

      if (progressQuery.empty) {
        await adminDb.collection('team_progress').add({
          teamId,
          challengeId,
          algorithmicCompleted: false,
          buildathonCompleted: false,
          startedAt: new Date(),
          attempts: 1
        })
      } else {
        const progressDoc = progressQuery.docs[0]
        await progressDoc.ref.update({
          attempts: (progressDoc.data().attempts || 0) + 1
        })
      }

      return NextResponse.json({ error: "Invalid flag" }, { status: 400 })
    }
  } catch (error) {
    console.error("Flag submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
