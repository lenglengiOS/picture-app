import { CompressTask } from "./compressSingleImageWithProgress";

export async function saveCompressedResult(
  task: CompressTask,
  outputDir: string,
  outputFormat: "origin" | "jpg",
  originalFilePath?: string
): Promise<string> {
  if (!task.compressed) return "";

  const origin = task.file;
  const originExt = origin.name.substring(origin.name.lastIndexOf("."));
  const ext = outputFormat === "jpg" ? ".jpg" : originExt;
  let outName = origin.name.replace(/\.[^.]+$/, ext);
  let outPath = joinPaths(outputDir, outName);

  // 如果输出路径和原文件路径相同，生成新的文件名避免覆盖
  if (originalFilePath) {
    const normalizedOriginalPath = normalizePath(originalFilePath);
    const normalizedOutPath = normalizePath(outPath);

    if (normalizedOriginalPath === normalizedOutPath) {
      // 生成新文件名，添加 _compressed 后缀，避免覆盖原文件
      const nameWithoutExt = origin.name.substring(
        0,
        origin.name.lastIndexOf(".")
      );
      outName = `${nameWithoutExt}_compressed${ext}`;
      outPath = joinPaths(outputDir, outName);
      // 主进程会自动处理文件名冲突
    }
  }

  const buffer = await task.compressed.arrayBuffer();
  // 主进程会自动处理文件冲突和权限问题，并返回实际保存的路径
  const savedPath = await window.api.saveFile(buffer, outPath);

  // 返回主进程返回的实际保存路径
  return savedPath;
}

// 规范化路径，用于比较
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").toLowerCase();
}

const joinPaths = (base: string, fileName: string) => {
  if (!base) return fileName;
  if (base.endsWith("/") || base.endsWith("\\")) {
    return `${base}${fileName}`;
  }
  const separator = base.includes("\\") ? "\\" : "/";
  return `${base}${separator}${fileName}`;
};
