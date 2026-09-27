import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyPassword, createSession, seedDemoUserIfNeeded } from "@/lib/auth";
import { User } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo } = body;

    // Fast-path demo login
    if (isDemo) {
      const demoUserId = await seedDemoUserIfNeeded();
      await createSession(demoUserId);
      return NextResponse.json({ success: true, redirect: "/home" });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db
      .collection<User>("users")
      .findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Check if user is trying to login with demo credentials before seed
      if (email.toLowerCase().trim() === "ismacil.dahir@example.com") {
        const demoUserId = await seedDemoUserIfNeeded();
        await createSession(demoUserId);
        return NextResponse.json({ success: true, redirect: "/home" });
      }
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(user._id?.toString() || "");
    return NextResponse.json({ success: true, redirect: "/home" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
