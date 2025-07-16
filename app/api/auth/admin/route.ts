import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// TODO: Backend Integration Point 2 - Admin Authentication
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Demo admin credentials
    const ADMIN_USERNAME = "admin"
    const ADMIN_PASSWORD = "oasis2045"

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        {
          username,
          role: "admin",
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        },
        process.env.NEXTAUTH_SECRET || "demo_secret_key_change_in_production",
      )

      return NextResponse.json({
        success: true,
        token,
        message: "Admin authenticated successfully",
      })
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Admin authentication error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
