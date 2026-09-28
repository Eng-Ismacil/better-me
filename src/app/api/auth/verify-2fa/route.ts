import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { codesMatch, normalizeCode } from "@/lib/admin";
import { User } from "@/types";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { token, otp, email } = await req.json();

    const cleanOtp = normalizeCode(otp);

    if (!cleanOtp) {
      return NextResponse.json(
        { error: "Koodhka 6-da god ah waa qasab / 6-digit OTP code is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const normalizedEmail = email ? String(email).trim().toLowerCase() : "";

    // Prefer lookup by token; fallback to email + latest unused
    let record = null;

    if (token) {
      record = await db.collection("twoFactorCodes").findOne(
        { token: String(token), used: false },
        { sort: { createdAt: -1 } }
      );
    }

    if (!record && normalizedEmail) {
      record = await db.collection("twoFactorCodes").findOne(
        { email: normalizedEmail, used: false },
        { sort: { createdAt: -1 } }
      );
    }

    if (!record) {
      return NextResponse.json(
        { error: "Kalfadhiga xaqiijintu wuu dhacay ama lama helin / Invalid or expired verification session" },
        { status: 401 }
      );
    }

    if (new Date() > new Date(record.expiresAt)) {
      await db.collection("twoFactorCodes").deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Koodhkani wuu dhacay, fadlan mar kale soo gal / Verification code has expired. Please sign in again." },
        { status: 401 }
      );
    }

    if (!codesMatch(record.otp, cleanOtp)) {
      return NextResponse.json(
        { error: "Koodhka aad gelisay waa qalad / Incorrect verification code. Please check your email." },
        { status: 401 }
      );
    }

    await db.collection("twoFactorCodes").updateOne(
      { _id: record._id },
      { $set: { used: true, usedAt: new Date().toISOString() } }
    );

    const userId = String(record.userId || "");
    await createSession(userId);

    let redirect = "/home";
    if (userId && ObjectId.isValid(userId)) {
      const user = await db.collection<User>("users").findOne({
        _id: new ObjectId(userId) as unknown as string,
      });
      if (user?.isAdmin) {
        redirect = "/admin";
      }
    }

    return NextResponse.json({ success: true, redirect });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
