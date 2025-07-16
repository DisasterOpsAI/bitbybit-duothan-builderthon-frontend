import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { teamName, authId } = await request.json()

    if (!teamName || !authId) {
      return NextResponse.json({ error: 'Team name and auth ID are required' }, { status: 400 })
    }

    // Find team by name and verify user is authorized
    const teamQuery = await adminDb
      .collection('teams')
      .where('name', '==', teamName.trim())
      .where('authId', '==', authId)
      .get()

    if (teamQuery.empty) {
      return NextResponse.json({ error: 'Team not found or unauthorized' }, { status: 404 })
    }

    const teamDoc = teamQuery.docs[0]
    const team = { id: teamDoc.id, ...teamDoc.data() }

    return NextResponse.json({ 
      success: true, 
      team
    })
  } catch (error) {
    console.error('Team verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}