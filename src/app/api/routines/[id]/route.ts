import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, icon, timeOfDay, habitIds } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Routine name is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    const update = {
      $set: {
        name: name.trim(),
        description: description?.trim() || "",
        icon: icon || "auto_stories",
        timeOfDay: timeOfDay || "Morning",
        habits: (habitIds || []).map((hId: string, idx: number) => ({
          habitId: hId,
          order: idx,
        })),
        updatedAt: now,
      },
    };

    const result = await db.collection("routines").updateOne(
      { _id: new ObjectId(id), userId: session.id },
      update
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection("routines").deleteOne({
      _id: new ObjectId(id),
      userId: session.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
