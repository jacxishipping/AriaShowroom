import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request): Promise<NextResponse> {
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

    if (!token) {
      // Local development simulation fallback if BLOB_READ_WRITE_TOKEN is not yet set
      const simulatedUrls = uploadList.map(
        (file, idx) =>
          `https://sadozai-media.public.blob.vercel-storage.com/vehicles/${Date.now()}-${idx}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      );
      return NextResponse.json({
        urls: simulatedUrls,
        isSimulated: true,
        message: "Vercel Blob simulation active. Set BLOB_READ_WRITE_TOKEN in .env for live CDN persistence.",
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
      { error: error.message || "Vercel Blob upload failed" },
      { status: 500 }
    );
  }
}
