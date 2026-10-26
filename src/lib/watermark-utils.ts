import { useShowroomStore } from "@/store/useShowroomStore";

/**
 * Client-Side Image Watermarking & WebP Optimization
 * Stamped onto vehicle inspection photos before uploading.
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
  const storeBranding = useShowroomStore.getState().branding;
  const defaultWatermarkName =
    storeBranding?.watermarkText ||
    `${(storeBranding?.dealershipName || "ARIA MOTORS").toUpperCase()} • HERAT`;

  const {
    stockNumber = `${storeBranding?.dealershipShortCode || "ARI"}-HRT`,
    showroomName = defaultWatermarkName,
    applyWatermark = true,
    maxWidth = 1600,
    quality = 0.82,
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

        ctx.drawImage(img, 0, 0, width, height);

        if (applyWatermark) {
          const badgeWidth = Math.min(width * 0.45, 420);
          const badgeHeight = 58;
          const padding = 24;
          const pos = storeBranding?.watermarkPosition || "bottom-right";
          const opacity = storeBranding?.watermarkOpacity ?? 0.78;

          let x = width - badgeWidth - padding;
          let y = height - badgeHeight - padding;
          if (pos === "bottom-left") {
            x = padding;
            y = height - badgeHeight - padding;
          } else if (pos === "center" || pos === "diagonal") {
            x = (width - badgeWidth) / 2;
            y = (height - badgeHeight) / 2;
          }

          const radius = 10;

          ctx.save();
          ctx.globalAlpha = Math.max(0.2, Math.min(1, opacity + 0.35));
          ctx.fillStyle = "rgba(11, 15, 25, 0.82)";
          ctx.beginPath();
          ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
          ctx.fill();

          ctx.strokeStyle = "rgba(217, 119, 6, 0.85)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = "#D97706";
          ctx.beginPath();
          ctx.roundRect(x + 8, y + 10, 4, badgeHeight - 20, 2);
          ctx.fill();

          ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(showroomName, x + 20, y + 24);

          ctx.font = "500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#D97706";
          ctx.fillText(`VERIFIED LOT #${stockNumber} • ISLAM QALA CLEARED`, x + 20, y + 43);

          ctx.restore();
        }

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
