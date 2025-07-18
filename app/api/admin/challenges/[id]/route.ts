import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Get single challenge by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const challengeId = params.id;
      const doc = await adminDb.collection('challenges').doc(challengeId).get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }

      const challenge = {
        id: doc.id,
        ...doc.data()
      };

      return NextResponse.json(challenge);
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// Update challenge
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const challengeId = params.id;
      const updateData = await req.json();

      // Validate required fields
      if (!updateData.title) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Update the challenge in Firestore
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await adminDb.collection('challenges').doc(challengeId).update(updatePayload);

      return NextResponse.json({
        success: true,
        message: "Challenge updated successfully"
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// Delete challenge
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const challengeId = params.id;
      await adminDb.collection('challenges').doc(challengeId).delete();

      return NextResponse.json({
        success: true,
        message: "Challenge deleted successfully",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}
