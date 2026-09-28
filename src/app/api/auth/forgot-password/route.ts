import { NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/resend";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email-ka waa qasab / Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    await ensureIndexes();
    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({ email: normalizedEmail });

    // Generate a 6-digit numeric verification code and a secure token
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Invalidate existing active resets for this email
    await db
      .collection("passwordResets")
      .deleteMany({ email: normalizedEmail });

    await db.collection("passwordResets").insertOne({
      email: normalizedEmail,
      code,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const resetUrl = `${appUrl}/reset-password?email=${encodeURIComponent(
      normalizedEmail
    )}&code=${code}`;

    // Send email via Resend
    const emailResult = await sendPasswordResetEmail({
      toEmail: normalizedEmail,
      userName: user?.name || "BetterMe User",
      resetCode: code,
      resetUrl,
    });

    if (!emailResult.success && process.env.NODE_ENV === "production") {
      await db.collection("passwordResets").deleteOne({ token });
      return NextResponse.json(
        { error: "Unable to send the reset email. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      message: emailResult.success
        ? "Koodhka dib u dejinta waxaa loo diray email-kaaga."
        : "Development reset code generated.",
      demoCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
