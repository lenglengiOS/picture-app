import imageCompression from "browser-image-compression";

export interface CompressTask {
  file: File;
  progress: number;
  compressed?: File;
  canceled?: boolean;
}

export function compressSingleImageWithProgress(
  file: File,
  quality: number,
  outputFormat: "origin" | "jpg",
  onProgress: (p: number) => void,
  cancelFlag: { canceled: boolean }
): Promise<File | null> {
  return new Promise(async (resolve, reject) => {
    try {
      if (cancelFlag.canceled) return resolve(null);

      const options = {
        maxSizeMB: 4,
        initialQuality: quality,
        useWebWorker: true,
        fileType: outputFormat === "jpg" ? "image/jpeg" : undefined,
        onProgress: (p: number) => {
          if (!cancelFlag.canceled) onProgress(p);
        },
      };

      const compressed = await imageCompression(file, options);
      if (cancelFlag.canceled) return resolve(null);

      resolve(compressed);
    } catch (err) {
      reject(err);
    }
  });
}
