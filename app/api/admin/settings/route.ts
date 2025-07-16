import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { adminDb } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic'

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Try to get settings from database first
    const settingsDoc = await adminDb.collection('platform_settings').doc('main').get()
    
    let settings = {
      registrationEnabled: true,
      submissionEnabled: true,
      leaderboardPublic: true,
      maintenanceMode: false,
      platformTitle: "The OASIS Protocol",
      platformDescription: "A Ready Player One inspired coding challenge platform",
      judge0ApiUrl: process.env.JUDGE0_API_URL || "http://10.3.5.139:2358/",
      judge0ApiToken: "••••••••••••••••", // Masked for security
      maxTeamSize: 4,
      submissionCooldown: 30,
      challengeTimeLimit: 3600
    }
    
    if (settingsDoc.exists) {
      const dbSettings = settingsDoc.data()
      settings = { ...settings, ...dbSettings }
    }
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const PUT = requireAdmin(async (request: NextRequest) => {
  try {
    const { settings } = await request.json()
    
    // Don't store API credentials in database - they should remain in environment variables
    const sanitizedSettings = {
      ...settings,
      judge0ApiUrl: undefined, // Remove from database storage
      judge0ApiToken: undefined // Remove from database storage
    }
    
    // Save to database
    await adminDb.collection('platform_settings').doc('main').set(sanitizedSettings, { merge: true })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})