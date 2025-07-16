import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { submissionId, action, feedback } = await request.json()
    
    // Validate admin authentication
    const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
    }

    if (!submissionId || !action) {
      return NextResponse.json({ error: "Submission ID and action are required" }, { status: 400 })
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Action must be 'accept' or 'reject'" }, { status: 400 })
    }

    // Get submission details
    const submissionDoc = await adminDb.collection('submissions').doc(submissionId).get()
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const submissionData = submissionDoc.data()
    const { teamId, challengeId } = submissionData

    // Update submission status
    await submissionDoc.ref.update({
      status: action === 'accept' ? 'accepted' : 'rejected',
      evaluatedAt: new Date(),
      feedback: feedback || null
    })

    if (action === 'accept') {
      // Get challenge info for points
      const challengeDoc = await adminDb.collection('challenges').doc(challengeId).get()
      const challengeData = challengeDoc.data()
      const points = challengeData?.points || 0

      // Update team progress
      const progressQuery = await adminDb
        .collection('team_progress')
        .where('teamId', '==', teamId)
        .where('challengeId', '==', challengeId)
        .get()

      if (!progressQuery.empty) {
        const progressDoc = progressQuery.docs[0]
        await progressDoc.ref.update({
          buildathonCompleted: true,
          buildathonCompletedAt: new Date()
        })
      }

      // Award points to team
      const teamDoc = await adminDb.collection('teams').doc(teamId).get()
      if (teamDoc.exists) {
        const currentData = teamDoc.data()
        const currentPoints = currentData?.totalPoints || 0
        const completedChallenges = currentData?.completedChallenges || []
        
        // Only award points if challenge not already completed
        if (!completedChallenges.includes(challengeId)) {
          const { FieldValue } = await import('firebase-admin/firestore')
          await teamDoc.ref.update({
            totalPoints: currentPoints + points,
            completedChallenges: FieldValue.arrayUnion(challengeId),
            updatedAt: new Date()
          })
        }
      }

      // Update submission with points
      await submissionDoc.ref.update({
        points: points
      })

      // Create notification for team
      const teamNotification = {
        type: 'buildathon_accepted',
        teamId,
        challengeId,
        message: `Your buildathon submission has been accepted! You earned ${points} points.`,
        createdAt: new Date(),
        isRead: false
      }
      
      await adminDb.collection('team_notifications').add(teamNotification)
    } else {
      // Create rejection notification for team
      const teamNotification = {
        type: 'buildathon_rejected',
        teamId,
        challengeId,
        message: `Your buildathon submission has been rejected. ${feedback ? `Feedback: ${feedback}` : ''}`,
        createdAt: new Date(),
        isRead: false
      }
      
      await adminDb.collection('team_notifications').add(teamNotification)
    }

    // Mark admin notification as read
    const adminNotificationQuery = await adminDb
      .collection('admin_notifications')
      .where('submissionId', '==', submissionId)
      .get()

    if (!adminNotificationQuery.empty) {
      const notificationDoc = adminNotificationQuery.docs[0]
      await notificationDoc.ref.update({
        isRead: true,
        reviewedAt: new Date()
      })
    }

    return NextResponse.json({
      success: true,
      message: `Submission ${action}ed successfully`,
      action,
      submissionId
    })

  } catch (error) {
    console.error("Submission review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}