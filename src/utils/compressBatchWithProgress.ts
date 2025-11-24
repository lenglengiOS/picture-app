import {
  CompressTask,
  compressSingleImageWithProgress,
} from "./compressSingleImageWithProgress";

export interface BatchCompressController {
  tasks: CompressTask[];
  cancelAll: () => void;
}

export function compressBatchWithProgress(
  files: File[],
  quality: number,
  outputFormat: "origin" | "jpg",
  onTaskProgress: (index: number, progress: number) => void,
  onTaskComplete: (index: number, file: File | null) => void
): BatchCompressController {
  const tasks: CompressTask[] = files.map((f) => ({ file: f, progress: 0 }));
  const cancelFlags = files.map(() => ({ canceled: false }));

  async function start() {
    for (let i = 0; i < files.length; i++) {
      const task = tasks[i];
      const cancelFlag = cancelFlags[i];
      const compressed = await compressSingleImageWithProgress(
        task.file,
        quality,
        outputFormat,
        (p) => {
          task.progress = p;
          onTaskProgress(i, p);
        },
        cancelFlag
      );
      task.compressed = compressed || undefined;
      task.canceled = cancelFlag.canceled;
      onTaskComplete(i, compressed || null);
    }
  }

  function cancelAll() {
    cancelFlags.forEach((flag) => (flag.canceled = true));
  }

  start();

  return { tasks, cancelAll };
}
