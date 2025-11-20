const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { compressImage } = require("./src/utils/compress");

try {
  require("electron-reloader")(module);
} catch (_) {}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1000,
    minHeight: 600,
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
ipcMain.handle("select-image", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }],
  });
  return result.canceled ? null : result.filePaths[0];
});

// IPC: 选择输出目录
ipcMain.handle("select-output-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

// IPC: 压缩图片
ipcMain.handle("compress-image", async (event, args) => {
  return await compressImage(args);
});

app.whenReady().then(createWindow);
