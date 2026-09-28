import { NextResponse } from "next/server";
import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/**
 * GET /api/admin/seed
 * Seeds the admin user ismacildahir46@gmail.com with 2FA enabled.
 * Should only be called once — idempotent.
 */
export async function GET() {
  try {
    await ensureIndexes();
    const { db } = await connectToDatabase();

    const adminEmail = "ismacildahir46@gmail.com";
    const existing = await db.collection("users").findOne({ email: adminEmail });

    if (existing) {
      // Update to ensure isAdmin + twoFactorEnabled flags are set
      await db.collection("users").updateOne(
        { email: adminEmail },
        { $set: { isAdmin: true, twoFactorEnabled: true, updatedAt: new Date().toISOString() } }
      );
      return NextResponse.json({
        success: true,
        message: "Admin user already exists — flags updated.",
        email: adminEmail,
      });
    }

    // Create fresh admin account
    const passwordHash = await hashPassword("Admin@BetterMe2026!");
    const now = new Date().toISOString();

    await db.collection("users").insertOne({
      name: "Ismacil Dahir",
      email: adminEmail,
      passwordHash,
      avatarUrl: "/images/avatar.jpg",
      memberSince: "Admin",
      isAdmin: true,
      twoFactorEnabled: true,
      timezone: "UTC",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully.",
      email: adminEmail,
      defaultPassword: "Admin@BetterMe2026!",
      note: "2FA is enabled — a code will be emailed on each login.",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
