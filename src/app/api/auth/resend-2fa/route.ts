import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { sendTwoFactorCode } from "@/lib/resend";
import { User } from "@/types";
import { randomBytes } from "crypto";

/**
 * POST /api/auth/resend-2fa
 * Regenerate OTP for an existing unused 2FA session.
 * Keeps the same token when a valid unused token is provided.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const token = body.token ? String(body.token) : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await ensureIndexes();
    const { db } = await connectToDatabase();

    const user = await db.collection<User>("users").findOne({ email });
    if (!user || user.deletedAt || user.status === "disabled") {
      return NextResponse.json(
        { error: "Unable to resend verification code" },
        { status: 400 }
      );
    }

    let existing = null;
    if (token) {
      existing = await db.collection("twoFactorCodes").findOne({
        email,
        token,
        used: false,
      });
    }

    if (!existing) {
      existing = await db.collection("twoFactorCodes").findOne(
        { email, used: false },
        { sort: { createdAt: -1 } }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    let twoFactorToken = token;

    if (existing && (!token || existing.token === token)) {
      // Keep same token when provided and valid; otherwise reuse latest unused token
      twoFactorToken = String(existing.token);
      await db.collection("twoFactorCodes").updateOne(
        { _id: existing._id },
        {
          $set: {
            otp,
            expiresAt,
            used: false,
            updatedAt: now,
          },
        }
      );
    } else {
      // No valid unused session — create a new one
      twoFactorToken = randomBytes(20).toString("hex");
      await db.collection("twoFactorCodes").deleteMany({ email });
      await db.collection("twoFactorCodes").insertOne({
        email,
        userId: user._id?.toString(),
        otp,
        token: twoFactorToken,
        expiresAt,
        used: false,
        createdAt: now,
      });
    }

    await sendTwoFactorCode({
      toEmail: email,
      userName: user.name,
      code: otp,
    });

    return NextResponse.json({
      success: true,
      twoFactorToken,
      message: "Verification code resent",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
