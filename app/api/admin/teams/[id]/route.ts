import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Get single team by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const teamId = params.id;
      const doc = await adminDb.collection('teams').doc(teamId).get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "Team not found" },
          { status: 404 }
        );
      }

      const teamData = doc.data();
      const team = {
        id: doc.id,
        name: teamData?.name || 'Unknown Team',
        members: teamData?.members || [],
        createdAt: teamData?.createdAt ? teamData.createdAt.toDate().toISOString() : new Date().toISOString(),
        totalPoints: teamData?.totalPoints || 0,
        completedChallenges: 0,
        lastActivity: 'No activity'
      };

      return NextResponse.json(team);
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// Update team
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const teamId = params.id;
      const updateData = await req.json();

      // Validate required fields
      if (!updateData.name) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Update the team in Firestore
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await adminDb.collection('teams').doc(teamId).update(updatePayload);

      return NextResponse.json({
        success: true,
        message: "Team updated successfully"
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// Delete team
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const teamId = params.id;
      await adminDb.collection('teams').doc(teamId).delete();

      return NextResponse.json({
        success: true,
        message: "Team deleted successfully",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}