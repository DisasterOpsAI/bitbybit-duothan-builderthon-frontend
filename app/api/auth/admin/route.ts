import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { adminDb } from "@/lib/firebase-admin"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check environment variables first for demo
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@oasis.com"
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "oasis2045"

    // Check demo credentials
    if ((username === "admin" || username === ADMIN_EMAIL) && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        {
          username: username === "admin" ? ADMIN_EMAIL : username,
          role: "admin",
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        },
        process.env.JWT_SECRET || "demo_secret_key_change_in_production",
      )

      // Update last login time in database
      try {
        const adminQuery = await adminDb
          .collection('admins')
          .where('email', '==', ADMIN_EMAIL)
          .get()

        if (adminQuery.empty) {
          // Create admin user if doesn't exist
          const adminData = {
            email: ADMIN_EMAIL,
            passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
            role: 'admin',
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
          await adminDb.collection('admins').add(adminData)
        } else {
          // Update last login
          const adminDoc = adminQuery.docs[0]
          await adminDoc.ref.update({ lastLoginAt: new Date() })
        }
      } catch (dbError) {
        console.error("Error updating admin login:", dbError)
        // Continue with authentication even if DB update fails
      }

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
