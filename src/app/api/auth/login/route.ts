import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { sendTwoFactorCode } from "@/lib/resend";
import { User } from "@/types";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await ensureIndexes();
    const { db } = await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db
      .collection<User>("users")
      .findOne({ email: normalizedEmail });

    if (!user) {
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

    // Check if user requires 2FA
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userDoc = user as any;
    if (userDoc.isAdmin && userDoc.twoFactorEnabled) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = randomBytes(20).toString("hex");
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

      // Store OTP in db
      await db.collection("twoFactorCodes").deleteMany({ email: normalizedEmail });
      await db.collection("twoFactorCodes").insertOne({
        email: normalizedEmail,
        userId: user._id?.toString(),
        otp,
        token,
        expiresAt,
        used: false,
        createdAt: new Date().toISOString(),
      });

      // Send via Resend Email
      await sendTwoFactorCode({
        toEmail: normalizedEmail,
        userName: user.name,
        code: otp,
      });

      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        twoFactorToken: token,
      });
    }

    // Normal session login
    await createSession(user._id?.toString() || "");
    return NextResponse.json({ success: true, redirect: "/home" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
