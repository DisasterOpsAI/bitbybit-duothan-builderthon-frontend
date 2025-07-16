import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { Team } from '@/lib/database-schema'

export async function POST(request: NextRequest) {
  try {
    const { teamName, email, authProvider, authId } = await request.json()

    if (!teamName || !teamName.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    // Check if team name already exists
    const existingTeamName = await adminDb
      .collection('teams')
      .where('name', '==', teamName.trim())
      .get()

    if (!existingTeamName.empty) {
      return NextResponse.json({ error: 'Team name already exists' }, { status: 409 })
    }

    // If we have auth info, check if user already has a team
    if (authId) {
      const existingTeam = await adminDb
        .collection('teams')
        .where('authId', '==', authId)
        .get()

      if (!existingTeam.empty) {
        return NextResponse.json({ error: 'User already has a team' }, { status: 409 })
      }
    }

    // Create new team if all auth info is provided
    if (email && authProvider && authId) {
      const newTeam: Omit<Team, 'id'> = {
        name: teamName.trim(),
        email,
        authProvider,
        authId,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalPoints: 0,
        completedChallenges: []
      }

      const docRef = await adminDb.collection('teams').add(newTeam)
      
      return NextResponse.json({ 
        success: true, 
        teamId: docRef.id,
        team: { id: docRef.id, ...newTeam }
      })
    }

    // Just validate team name availability
    return NextResponse.json({
      success: true,
      message: 'Team name is available',
      teamName: teamName.trim(),
    })
  } catch (error) {
    console.error('Team registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
