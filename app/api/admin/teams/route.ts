import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const teamsSnapshot = await adminDb.collection('teams').get()
    const teams = []
    
    teamsSnapshot.forEach((doc) => {
      const data = doc.data()
      teams.push({
        id: doc.id,
        name: data.name || 'Unknown Team',
        members: data.members || [],
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        totalPoints: data.totalPoints || 0,
        completedChallenges: 0,
        lastActivity: 'No activity'
      })
    })
    
    teams.sort((a, b) => b.totalPoints - a.totalPoints)
    
    return NextResponse.json({ teams })
  } catch (error) {
    return NextResponse.json({ teams: [] })
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