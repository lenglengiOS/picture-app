const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
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
  await fs.promises.mkdir(require("path").dirname(outPath), {
    recursive: true,
  });
  await fs.promises.writeFile(outPath, Buffer.from(buffer));
  return true;
});

ipcMain.handle("open-folder", async (_, folderPath) => {
  return shell.openPath(folderPath);
});

app.whenReady().then(createWindow);
