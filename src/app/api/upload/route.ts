import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer | string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Sawir lama helin / No image file provided" },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json(
          { error: "Sawir lama helin / No image data provided" },
          { status: 400 }
        );
      }
      fileBuffer = body.image;
    }

    // Upload to Cloudinary (folder: salama-hub)
    const uploadResult = await uploadToCloudinary(fileBuffer, session.id);

    // Update MongoDB user profile with new Cloudinary avatarUrl
    const { db } = await connectToDatabase();
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.id) },
      {
        $set: {
          avatarUrl: uploadResult.secure_url,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      message: "Sawirka astaanta si guul leh ayaa loo bedelay / Profile photo updated successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
