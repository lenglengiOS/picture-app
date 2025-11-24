const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   selectImage: () => ipcRenderer.invoke("select-image"),
//   selectOutputFolder: () => ipcRenderer.invoke("select-output-folder"),
//   compressImage: (opts) => ipcRenderer.invoke("compress-image", opts),
//   selectFolderAndReadImages: () =>
//     ipcRenderer.invoke("select-folder-and-read-images"),
// });

contextBridge.exposeInMainWorld("api", {
  saveFile: (buffer, outPath) =>
    ipcRenderer.invoke("save-file", { buffer, outPath }),
  openFolder: (folderPath) => ipcRenderer.invoke("open-folder", folderPath),
});
