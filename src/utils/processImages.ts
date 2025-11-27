import { compressModes, CompressModeKey } from "./compressModes";
import {
  compressBatchWithProgress,
  BatchCompressController,
} from "./compressBatchWithProgress";

export interface ProcessImagesResult {
  controller: BatchCompressController;
  savedPaths: string[];
}

export function processImages(params: {
  files: File[];
  modeKey: CompressModeKey;
  outputFormat: "origin" | "jpg";
  outputDir: string;
  onTaskProgress: (index: number, progress: number) => void;
  onTaskComplete: (index: number, file: File | null) => void;
}): ProcessImagesResult {
  const {
    files,
    modeKey,
    outputFormat,
    outputDir,
    onTaskProgress,
    onTaskComplete,
  } = params;
  const quality = compressModes[modeKey].quality;

  const controller = compressBatchWithProgress(
    files,
    quality,
    outputFormat,
    onTaskProgress,
    onTaskComplete
  );

  return { controller, savedPaths: [] };
}
