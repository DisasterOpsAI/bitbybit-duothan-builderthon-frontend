import { NextRequest, NextResponse } from 'next/server'
import { adminTeamsCRUD } from '@/lib/firestore-crud'
import { Team } from '@/lib/database-schema'

export async function POST(request: NextRequest) {
  try {
    const { teamName, email, authProvider, authId } = await request.json()

    if (!teamName || !teamName.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    // Check if team name already exists
    const existingTeamName = await adminTeamsCRUD.getByName(teamName.trim())

    if (existingTeamName) {
      return NextResponse.json({ error: 'Team name already exists' }, { status: 409 })
    }

    // If we have auth info, check if user already has a team
    if (authId) {
      const existingTeam = await adminTeamsCRUD.getByAuthId(authId)

      if (existingTeam) {
        return NextResponse.json({ error: 'User already has a team' }, { status: 409 })
      }
    }

    // Create new team if all auth info is provided
    if (email && authProvider && authId) {
      const newTeam: Omit<Team, 'id' | 'createdAt' | 'updatedAt'> = {
        name: teamName.trim(),
        email,
        authProvider,
        authId,
        totalPoints: 0,
        completedChallenges: []
      }

      const teamId = await adminTeamsCRUD.create(newTeam)
      const createdTeam = await adminTeamsCRUD.getById(teamId)
      
      return NextResponse.json({ 
        success: true, 
        teamId,
        team: createdTeam
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
