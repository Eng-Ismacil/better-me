import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { calculateUserAchievements } from "@/lib/achievements";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gamification = await calculateUserAchievements(session.id);
    return NextResponse.json({
      success: true,
      ...gamification,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
