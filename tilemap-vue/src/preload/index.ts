import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const fileAPI = {
  openFileDialog: (typeName: string, extensions: string[]) =>
    ipcRenderer.invoke('dialog:openFile', typeName, extensions),
  saveFileDialog: (defaultName: string, extensions: string[]) =>
    ipcRenderer.invoke('dialog:saveFile', defaultName, extensions),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:write', filePath, content),
  getImgBase64: (filePath: string) => ipcRenderer.invoke('file:imgBase64', filePath)
};

const libAPI = {
  listFiles: (collectionType: string) => ipcRenderer.invoke('lib:listFiles', collectionType),
  readFile: (collectionType: string, fileName: string) =>
    ipcRenderer.invoke('lib:readFile', collectionType, fileName),
  writeFile: (collectionType: string, fileName: string, data: object) =>
    ipcRenderer.invoke('lib:writeFile', collectionType, fileName, data),
  deleteFile: (collectionType: string, fileName: string) =>
    ipcRenderer.invoke('lib:deleteFile', collectionType, fileName),
  exportFile: (collectionType: string, fileName: string) =>
    ipcRenderer.invoke('lib:exportFile', collectionType, fileName),
  importFile: (collectionType: string) => ipcRenderer.invoke('lib:importFile', collectionType)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('fileAPI', fileAPI);
    contextBridge.exposeInMainWorld('libAPI', libAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.fileAPI = fileAPI;
  // @ts-ignore (define in dts)
  window.libAPI = libAPI;
}
