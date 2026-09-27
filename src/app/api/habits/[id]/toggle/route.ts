import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleHabitCompletion, getTodayDateString } from "@/lib/habits";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const date = body.date || getTodayDateString();

    const result = await toggleHabitCompletion(session.id, id, date);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Failed to toggle habit" },
      { status: 500 }
    );
  }
}
