import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const unreadOnly = url.searchParams.get('unread') === 'true'

    // Build query
    let query = adminDb.collection('admin_notifications').orderBy('submittedAt', 'desc')

    if (unreadOnly) {
      query = query.where('isRead', '==', false)
    }

    query = query.limit(limit)

    const snapshot = await query.get()
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      notifications,
      total: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length
    })

  } catch (error) {
    console.error("Fetch notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Validate admin authentication
    const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!adminToken) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
    }

    const { notificationId, isRead } = await request.json()

    if (!notificationId || typeof isRead !== 'boolean') {
      return NextResponse.json({ error: "Notification ID and read status are required" }, { status: 400 })
    }

    // Update notification
    const notificationDoc = await adminDb.collection('admin_notifications').doc(notificationId).get()
    if (!notificationDoc.exists) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await notificationDoc.ref.update({
      isRead,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Notification updated successfully"
    })

  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}