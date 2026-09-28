import { NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Fadlan buuxi dhammaan xogta / Please fill all required fields" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Furaha sirta waa inuu ka yaraan 6 xaraf / Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    await ensureIndexes();
    const { db } = await connectToDatabase();

    const resetRecord = await db.collection("passwordResets").findOne({
      email: normalizedEmail,
      code: code.trim(),
      used: false,
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Koodhka xaqiijintu waa qalad / Invalid verification code" },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(resetRecord.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "Koodhkan wuu dhacay, fadlan mar kale dalbo / Code has expired, please request a new one" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    const updateResult = await db.collection("users").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          passwordHash: hashedPassword,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "Akoonka lagama helin diiwaanka / User account not found" },
        { status: 404 }
      );
    }

    // Mark reset code as used
    await db.collection("passwordResets").updateOne(
      { _id: resetRecord._id },
      { $set: { used: true, usedAt: new Date().toISOString() } }
    );

    return NextResponse.json({
      success: true,
      message: "Furaha sirta si guul leh ayaa loo cusbooneysiiyay / Password reset successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Reset password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
