export {};

declare global {
  interface Window {
    // electronAPI: {
    //   selectImage: () => void;
    //   selectOutputFolder: () => () => void;
    //   compressImage: (opts: any) => () => void;
    //   selectFolderAndReadImages: () => Promise<
    //     Array<{
    //       name: string;
    //       size: number;
    //       path: string;
    //       base64: string;
    //       mimeType: string;
    //     }> | null
    //   >;
    // };
    api: {
      saveFile: (buffer: ArrayBuffer, outPath: string) => Promise<string>;
      openFolder: (folderPath: string) => Promise<void>;
      chooseFolder: () => Promise<string | null>;
      getDesktopPath: () => Promise<string>;
    };
  }
}
