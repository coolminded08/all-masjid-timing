/**
 * Client-Side Image Resizer & Compressor
 * Shrinks massive mobile camera photos (5MB - 15MB) down to optimized JPEG (~250KB - 400KB)
 * before uploading. Prevents HTTP 413 (Request Entity Too Large) errors and speeds up AI scanning.
 */

export async function compressImageForOCR(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.85
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Failed to decode image data"));

      img.onload = () => {
        let { width, height } = img;

        // Scale down proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to original base64 if canvas context fails
          resolve({
            base64: reader.result as string,
            mimeType: file.type || "image/jpeg",
          });
          return;
        }

        // Draw image with high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG (optimal size/quality ratio for vision AI)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        resolve({
          base64: compressedDataUrl,
          mimeType: "image/jpeg",
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
