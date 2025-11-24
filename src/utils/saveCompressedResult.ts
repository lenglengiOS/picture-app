import path from "path";
import { CompressTask } from "./compressSingleImageWithProgress";

export async function saveCompressedResult(
  task: CompressTask,
  outputDir: string,
  outputFormat: "origin" | "jpg"
): Promise<string> {
  if (!task.compressed) return "";

  const origin = task.file;
  const originExt = origin.name.substring(origin.name.lastIndexOf("."));
  const ext = outputFormat === "jpg" ? ".jpg" : originExt;
  const outName = origin.name.replace(/\.[^.]+$/, ext);
  const outPath = path.join(outputDir, outName);

  const buffer = await task.compressed.arrayBuffer();
  await window.api.saveFile(buffer, outPath);

  return outPath;
}
