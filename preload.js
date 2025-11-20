const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectImage: () => ipcRenderer.invoke("select-image"),
  selectOutputFolder: () => ipcRenderer.invoke("select-output-folder"),
  compressImage: (opts) => ipcRenderer.invoke("compress-image", opts),
});
