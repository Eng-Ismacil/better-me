import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, otp } = await req.json();

    if (!token || !otp) {
      return NextResponse.json(
        { error: "Token and OTP code are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const record = await db.collection("twoFactorCodes").findOne({
      token,
      used: false,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification session" },
        { status: 401 }
      );
    }

    // Check expiry
    if (new Date() > new Date(record.expiresAt)) {
      await db.collection("twoFactorCodes").deleteOne({ token });
      return NextResponse.json(
        { error: "Verification code has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // Check OTP match
    if (record.otp !== otp.trim()) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 401 }
      );
    }

    // Mark as used
    await db.collection("twoFactorCodes").updateOne(
      { token },
      { $set: { used: true } }
    );

    // Create session for the admin user
    await createSession(record.userId);

    return NextResponse.json({ success: true, redirect: "/home" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
