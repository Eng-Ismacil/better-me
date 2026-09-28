import { NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { codesMatch, normalizeCode } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const cleanCode = normalizeCode(code);
    const cleanPassword = String(newPassword || "");

    if (!normalizedEmail || !cleanCode || !cleanPassword) {
      return NextResponse.json(
        { error: "Fadlan buuxi dhammaan xogta / Please fill in all fields" },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: "Furaha sirta waa inuu ka yaraan 6 xaraf / Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await ensureIndexes();
    const { db } = await connectToDatabase();

    // Find latest unused reset for this email, then compare code flexibly
    const resetRecord = await db.collection("passwordResets").findOne(
      {
        email: normalizedEmail,
        used: false,
      },
      { sort: { createdAt: -1 } }
    );

    if (!resetRecord || !codesMatch(resetRecord.code, cleanCode)) {
      const anyRecord = await db.collection("passwordResets").findOne(
        { email: normalizedEmail },
        { sort: { createdAt: -1 } }
      );

      if (anyRecord && anyRecord.used && codesMatch(anyRecord.code, cleanCode)) {
        return NextResponse.json(
          { error: "Koodhkan mar hore ayaa la isticmaalay, fadlan mid cusub dalbo / Code was already used. Please request a new one." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Koodhka xaqiijintu waa qalad / Invalid verification code. Please check your email." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(resetRecord.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "Koodhkan wuu dhacay, fadlan mar kale dalbo / Code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(cleanPassword);

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
