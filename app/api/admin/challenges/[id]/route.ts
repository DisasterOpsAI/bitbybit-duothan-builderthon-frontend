import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { adminChallengesCRUD } from "@/lib/firestore-crud";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Get single challenge by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const challengeId = params.id;
      const challenge = await adminChallengesCRUD.getById(challengeId);

      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(challenge);
    } catch (error) {
      console.error("Failed to fetch challenge:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Something went wrong",
        },
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
      if (
        !updateData.title ||
        !updateData.algorithmicProblem ||
        !updateData.buildathonProblem ||
        !updateData.flag
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const updatedChallenge = await adminChallengesCRUD.update(challengeId, updateData);

      return NextResponse.json({
        success: true,
        message: "Challenge updated successfully",
        challenge: updatedChallenge,
      });
    } catch (error) {
      console.error("Failed to update challenge:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Something went wrong",
        },
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
      await adminChallengesCRUD.delete(challengeId);

      return NextResponse.json({
        success: true,
        message: "Challenge deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete challenge:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development"
              ? errorMessage
              : "Something went wrong",
        },
        { status: 500 }
      );
    }
  })(request);
}
