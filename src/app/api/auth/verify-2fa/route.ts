import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, otp, email } = await req.json();

    const cleanOtp = String(otp || "").replace(/\D/g, "").trim();

    if (!cleanOtp) {
      return NextResponse.json(
        { error: "Koodhka 6-da god ah waa qasab / 6-digit OTP code is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find matching 2FA record by token or recent unused OTP
    let query: Record<string, unknown> = { used: false };
    if (token) {
      query.token = token;
    } else if (email) {
      query.email = String(email).trim().toLowerCase();
    }

    const record = await db.collection("twoFactorCodes").findOne(query, { sort: { createdAt: -1 } });

    if (!record) {
      return NextResponse.json(
        { error: "Kalfadhiga xaqiijintu wuu dhacay ama lama helin / Invalid or expired verification session" },
        { status: 401 }
      );
    }

    // Check expiry (10 minutes)
    if (new Date() > new Date(record.expiresAt)) {
      await db.collection("twoFactorCodes").deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "Koodhkani wuu dhacay, fadlan mar kale soo gal / Verification code has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // Check OTP match
    const storedOtp = String(record.otp || "").replace(/\D/g, "").trim();
    if (storedOtp !== cleanOtp) {
      return NextResponse.json(
        { error: "Koodhka aad gelisay waa qalad / Incorrect verification code. Please check your email." },
        { status: 401 }
      );
    }

    // Mark as used
    await db.collection("twoFactorCodes").updateOne(
      { _id: record._id },
      { $set: { used: true, usedAt: new Date().toISOString() } }
    );

    // Create session for the verified user
    await createSession(record.userId);

    return NextResponse.json({ success: true, redirect: "/home" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
