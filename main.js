const { app, BrowserWindow } = require("electron");
const path = require("path");

try {
  require("electron-reloader")(module);
} catch (_) {}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "build/icon.png"),
  });

  win.loadFile(path.join(__dirname, "src/renderer/index.html"));
}

app.whenReady().then(createWindow);
