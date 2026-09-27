import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { Habit } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const habit = await db.collection<Habit>("habits").findOne({
      _id: new ObjectId(id) as unknown as string,
      userId: session.id,
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({
      habit: { ...habit, _id: habit._id?.toString() },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const { db } = await connectToDatabase();

    const updateFields: Partial<Habit> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name) updateFields.name = body.name.trim();
    if (body.description !== undefined) updateFields.description = body.description.trim();
    if (body.category) updateFields.category = body.category;
    if (body.icon) updateFields.icon = body.icon;
    if (body.frequency) updateFields.frequency = body.frequency;
    if (body.difficulty) updateFields.difficulty = body.difficulty;
    if (body.preferredTime) updateFields.preferredTime = body.preferredTime;
    if (body.status) updateFields.status = body.status;
    if (body.target !== undefined) updateFields.target = Number(body.target);

    const result = await db.collection("habits").updateOne(
      { _id: new ObjectId(id), userId: session.id },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    const result = await db.collection("habits").deleteOne({
      _id: new ObjectId(id),
      userId: session.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Also delete completions
    await db.collection("habitCompletions").deleteMany({
      habitId: id,
      userId: session.id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
