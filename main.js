const { app, BrowserWindow } = require("electron");
const path = require("path");

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
    icon: path.join(__dirname, "build/icon.png"),
  });

  win.loadFile(path.join(__dirname, "src/renderer/index.html"));
}

app.whenReady().then(createWindow);
