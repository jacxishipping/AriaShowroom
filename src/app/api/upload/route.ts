import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireApiRole } from "@/lib/api-auth";

const MAX_FILES = 12;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per photo
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request): Promise<NextResponse> {
  const unauthorized = await requireApiRole(["ADMIN", "SALES"]);
  if (unauthorized) return unauthorized;

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const uploadList: File[] = [];
    if (files && files.length > 0) {
      uploadList.push(...files);
    } else if (singleFile) {
      uploadList.push(singleFile);
    }

    if (uploadList.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (uploadList.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Cannot upload more than ${MAX_FILES} photos at once` },
        { status: 400 }
      );
    }

    for (const file of uploadList) {
      const mime = (file.type || "").toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mime)) {
        return NextResponse.json(
          {
            error: `Unsupported file type "${file.type || "unknown"}". Only JPEG, PNG, and WebP images are permitted.`,
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the 5 MB per-photo limit.`,
          },
          { status: 413 }
        );
      }
    }

    if (!token) {
      // Durable Base64 data URL fallback when BLOB_READ_WRITE_TOKEN is not configured
      const dataUrls = await Promise.all(
        uploadList.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          const mime = file.type || "image/webp";
          return `data:${mime};base64,${buffer.toString("base64")}`;
        })
      );
      return NextResponse.json({
        urls: dataUrls,
        isSimulated: false,
        message: `Processed and persisted ${dataUrls.length} photo(s) locally (Base64 data storage).`,
      });
    }

    // Direct upload to Vercel Blob Storage
    const uploadedBlobs = await Promise.all(
      uploadList.map(async (file) => {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`vehicles/${Date.now()}-${cleanName}`, file, {
          access: "public",
          token,
        });
        return blob.url;
      })
    );

    return NextResponse.json({
      urls: uploadedBlobs,
      isSimulated: false,
      message: `Successfully uploaded ${uploadedBlobs.length} photos to Vercel Blob Storage`,
    });
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json(
      { error: error.message || "Photo upload failed" },
      { status: 500 }
    );
  }
}
