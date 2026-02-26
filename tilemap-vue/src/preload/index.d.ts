import { ElectronAPI } from '@electron-toolkit/preload';

interface FileAPI {
  openFileDialog: (typeName: string, extensions: string[]) => Promise<string | null>;
  saveFileDialog: (defaultName: string, extensions: string[]) => Promise<string | null>;
  readFile: (filePath: string) => Promise<string | null>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
  getImgBase64: (filePath: string) => Promise<string | null>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    fileAPI: FileAPI;
  }
}
