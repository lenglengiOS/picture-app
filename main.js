const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { compressImage } = require("./src/utils/compress");

try {
  require("electron-reloader")(module);
} catch (_) {}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1100,
    minHeight: 700,
    frame: true,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "build/icon.png"),
  });

  win.loadFile(path.join(__dirname, "src/renderer/index.html"));
}

// IPC: 选择图片
// ipcMain.handle("select-image", async () => {
//   const result = await dialog.showOpenDialog({
//     properties: ["openFile"],
//     filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }],
//   });
//   return result.canceled ? null : result.filePaths[0];
// });

// IPC: 选择输出目录
// ipcMain.handle("select-output-folder", async () => {
//   const result = await dialog.showOpenDialog({
//     properties: ["openDirectory"],
//   });
//   return result.canceled ? null : result.filePaths[0];
// });

// IPC: 压缩图片
// ipcMain.handle("compress-image", async (event, args) => {
//   return await compressImage(args);
// });

// // 递归读取文件夹中的所有图片文件
// function readImageFilesFromDirectory(dirPath) {
//   const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
//   const imageFiles = [];

//   function traverseDirectory(currentPath) {
//     try {
//       const items = fs.readdirSync(currentPath);

//       for (const item of items) {
//         const fullPath = path.join(currentPath, item);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//           // 递归遍历子目录
//           traverseDirectory(fullPath);
//         } else if (stat.isFile()) {
//           // 检查文件扩展名
//           const ext = path.extname(item).toLowerCase();
//           if (imageExtensions.includes(ext)) {
//             imageFiles.push({
//               path: fullPath,
//               name: item,
//               size: stat.size,
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error(`读取目录 ${currentPath} 时出错:`, error);
//     }
//   }

//   traverseDirectory(dirPath);
//   return imageFiles;
// }

// // IPC: 选择文件夹并读取图片
// ipcMain.handle("select-folder-and-read-images", async () => {
//   const result = await dialog.showOpenDialog({
//     properties: ["openDirectory"],
//   });

//   if (result.canceled || result.filePaths.length === 0) {
//     return null;
//   }

//   const folderPath = result.filePaths[0];
//   const imageFiles = readImageFilesFromDirectory(folderPath);

//   // 读取文件内容并转换为 base64，以便在渲染进程中创建 File 对象
//   const filesWithData = imageFiles.map((fileInfo) => {
//     const buffer = fs.readFileSync(fileInfo.path);
//     const base64 = buffer.toString("base64");
//     const mimeType = getMimeType(fileInfo.path);

//     return {
//       name: fileInfo.name,
//       size: fileInfo.size,
//       path: fileInfo.path,
//       base64: base64,
//       mimeType: mimeType,
//     };
//   });

//   return filesWithData;
// });

// // 根据文件扩展名获取 MIME 类型
// function getMimeType(filePath) {
//   const ext = path.extname(filePath).toLowerCase();
//   const mimeTypes = {
//     ".jpg": "image/jpeg",
//     ".jpeg": "image/jpeg",
//     ".png": "image/png",
//     ".gif": "image/gif",
//   };
//   return mimeTypes[ext] || "image/jpeg";
// }

ipcMain.handle("save-file", async (_, { buffer, outPath }) => {
  try {
    await fs.promises.mkdir(path.dirname(outPath), {
      recursive: true,
    });

    // 如果文件已存在且可能是原文件，生成唯一文件名
    let finalPath = outPath;
    if (await fileExists(outPath)) {
      finalPath = await getUniqueFilePath(outPath);
    }

    await fs.promises.writeFile(finalPath, Buffer.from(buffer));
    return finalPath;
  } catch (error) {
    // 如果写入失败（可能是权限问题），尝试生成唯一文件名
    if (
      error.code === "EACCES" ||
      error.code === "EPERM" ||
      error.code === "EBUSY"
    ) {
      try {
        // 如果是因为尝试覆盖原文件导致的权限错误，生成唯一文件名
        const uniquePath = await getUniqueFilePath(outPath);
        if (uniquePath !== outPath) {
          await fs.promises.writeFile(uniquePath, Buffer.from(buffer));
          return uniquePath;
        }
      } catch (retryError) {
        // 如果生成唯一文件名后仍然失败，抛出更友好的错误信息
        throw new Error(
          `无法保存文件到 "${path.dirname(outPath)}"：${
            error.message
          }。请检查文件权限或选择其他输出目录。`
        );
      }
    }
    // 其他错误直接抛出
    throw error;
  }
});

// 检查文件是否存在
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 获取唯一的文件路径（如果文件已存在，添加数字后缀）
async function getUniqueFilePath(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  let counter = 1;
  let newPath = filePath;

  // 如果原文件名不包含 _compressed，先尝试添加它
  if (!baseName.includes("_compressed")) {
    newPath = path.join(dir, `${baseName}_compressed${ext}`);
    if (!(await fileExists(newPath))) {
      return newPath;
    }
  }

  // 如果 _compressed 版本也存在，添加数字后缀
  while (await fileExists(newPath)) {
    const nameWithoutCompressed = baseName.replace(/_compressed$/, "");
    newPath = path.join(
      dir,
      `${nameWithoutCompressed}_compressed_${counter}${ext}`
    );
    counter++;

    // 防止无限循环
    if (counter > 1000) {
      throw new Error("无法生成唯一的文件名");
    }
  }

  return newPath;
}

ipcMain.handle("open-folder", async (_, folderPath) => {
  return shell.openPath(folderPath);
});

ipcMain.handle("choose-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle("get-desktop-path", async () => {
  const homeDir = os.homedir();
  const desktopPath = path.join(homeDir, "Desktop");
  return desktopPath;
});

app.whenReady().then(createWindow);
