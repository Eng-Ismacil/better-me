import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer | string;
    let mimeType = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Fadlan soo dooro sawir / Please provide an image file" },
          { status: 400 }
        );
      }

      mimeType = file.type;
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
        return NextResponse.json(
          {
            error:
              "Kaliya faylasha sawirrada ah (JPG, PNG, WebP, GIF) ayaa la ogolyahay / Only image files are allowed",
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json().catch(() => ({}));
      if (!body.image || typeof body.image !== "string") {
        return NextResponse.json(
          { error: "Fadlan soo dooro sawir / Please provide an image" },
          { status: 400 }
        );
      }

      if (!body.image.startsWith("data:image/")) {
        return NextResponse.json(
          {
            error:
              "Kaliya faylasha sawirrada ah ayaa la ogolyahay / Only image data URIs are allowed",
          },
          { status: 400 }
        );
      }

      fileBuffer = body.image;
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(fileBuffer, session.id);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Support image upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
