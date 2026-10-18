/**
 * Client-Side Image Watermarking & WebP Optimization
 * Stamped onto vehicle inspection photos before uploading to Vercel Blob.
 */

export interface WatermarkOptions {
  stockNumber?: string;
  showroomName?: string;
  applyWatermark?: boolean;
  maxWidth?: number;
  quality?: number; // 0.1 to 1.0
}

export async function processAndWatermarkImage(
  file: File,
  options: WatermarkOptions = {}
): Promise<File> {
  const {
    stockNumber = "SM-HRT",
    showroomName = "SADOZAI MOTORS • HERAT",
    applyWatermark = true,
    maxWidth = 2048,
    quality = 0.85,
  } = options;

  // If not in a browser environment, return original file
  if (typeof window === "undefined" || !window.document) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate proportional scale
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw original scaled image
        ctx.drawImage(img, 0, 0, width, height);

        if (applyWatermark) {
          // Watermark badge dimensions
          const badgeWidth = Math.min(width * 0.45, 420);
          const badgeHeight = 58;
          const padding = 24;
          const x = width - badgeWidth - padding;
          const y = height - badgeHeight - padding;
          const radius = 10;

          // Semi-transparent dark glass background
          ctx.save();
          ctx.fillStyle = "rgba(11, 15, 25, 0.78)";
          ctx.beginPath();
          ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
          ctx.fill();

          // Gold border outline
          ctx.strokeStyle = "rgba(217, 119, 6, 0.85)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Gold Accent Bar on Left of Badge
          ctx.fillStyle = "#D97706";
          ctx.beginPath();
          ctx.roundRect(x + 8, y + 10, 4, badgeHeight - 20, 2);
          ctx.fill();

          // Primary Showroom Text
          ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(showroomName, x + 20, y + 24);

          // Secondary Sub-label (Customs & Stock ID)
          ctx.font = "500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#D97706";
          ctx.fillText(`VERIFIED LOT #${stockNumber} • ISLAM QALA CLEARED`, x + 20, y + 43);

          ctx.restore();
        }

        // Convert canvas to optimized WebP Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const processedFile = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(processedFile);
          },
          "image/webp",
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
