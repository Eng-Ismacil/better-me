import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export { cloudinary };

// Cache time offset between local clock and Cloudinary server time
let cachedOffsetSeconds = 0;
let lastOffsetCheck = 0;

async function getAccurateTimestamp(): Promise<number> {
  const now = Date.now();
  // Refresh offset check every 15 minutes
  if (now - lastOffsetCheck > 15 * 60 * 1000) {
    try {
      const pingRes = await fetch("https://api.cloudinary.com/v1_1/ping", { method: "GET" });
      const serverDate = pingRes.headers.get("date");
      if (serverDate) {
        const serverTimeMs = new Date(serverDate).getTime();
        cachedOffsetSeconds = Math.round((serverTimeMs - now) / 1000);
        lastOffsetCheck = now;
      }
    } catch {
      // Keep previous cached offset if ping fails
    }
  }
  return Math.floor(Date.now() / 1000) + cachedOffsetSeconds;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  userId: string
): Promise<{ secure_url: string; public_id: string }> {
  const folder = process.env.CLOUDINARY_FOLDER || "salama-hub";
  const timestamp = await getAccurateTimestamp();

  return new Promise((resolve, reject) => {
    if (typeof fileBuffer === "string" && fileBuffer.startsWith("data:")) {
      // Base64 Data URI
      cloudinary.uploader.upload(
        fileBuffer,
        {
          folder,
          public_id: `user_${userId}_${Date.now()}`,
          timestamp,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );
    } else {
      // Buffer stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `user_${userId}_${Date.now()}`,
          timestamp,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary stream upload failed"));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );

      uploadStream.on("error", (err) => {
        reject(err || new Error("Cloudinary upload stream emitted error"));
      });

      const buffer = Buffer.isBuffer(fileBuffer)
        ? fileBuffer
        : Buffer.from(fileBuffer);
      uploadStream.end(buffer);
    }
  });
}

