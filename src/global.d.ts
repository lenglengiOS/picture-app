export {};

declare global {
  interface Window {
    electronAPI: {
      selectImage: () => void;
      selectOutputFolder: () => () => void;
      compressImage: (opts: any) => () => void;
    };
  }
}
