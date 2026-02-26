import { ipcMain, dialog, app } from 'electron';
import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

function getLibDir(collectionType: string): string {
  const base = is.dev ? join(app.getAppPath(), 'resources') : process.resourcesPath;
  return join(base, 'object_lib', `${collectionType}_lib`);
}

export function registerFileHandlers(): void {
  // Open file dialog
  ipcMain.handle('dialog:openFile', async (_, typeName: string, extensions: string[]) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: typeName, extensions }]
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // Save file dialog
  ipcMain.handle('dialog:saveFile', async (_, defaultName: string, extensions: string[]) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters: [{ name: 'TileMap File', extensions }]
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });

  // Read file content
  ipcMain.handle('file:read', async (_, filePath: string) => {
    if (!existsSync(filePath)) return null;
    const content = await readFile(filePath, 'utf-8');
    return content;
  });

  // Write file content
  ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
    await writeFile(filePath, content, 'utf-8');
    return true;
  });

  // Get image as base64
  ipcMain.handle('file:imgBase64', async (_, filePath: string) => {
    if (!existsSync(filePath)) return null;
    const buffer = await readFile(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() ?? 'png';
    return `data:image/${ext};base64,${buffer.toString('base64')}`;
  });

  // List lib files in a collection type directory
  ipcMain.handle('lib:listFiles', async (_, collectionType: string) => {
    const dir = getLibDir(collectionType);
    if (!existsSync(dir)) return [];
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith('.tilemap') || f.endsWith('.json'));
  });

  // Read a lib file
  ipcMain.handle('lib:readFile', async (_, collectionType: string, fileName: string) => {
    const filePath = join(getLibDir(collectionType), fileName);
    if (!existsSync(filePath)) return null;
    const content = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    // 兼容旧格式（带 file_head/file_data 包装）
    if (parsed.file_data) return parsed.file_data;
    return parsed;
  });

  // Write a lib file
  ipcMain.handle(
    'lib:writeFile',
    async (_, collectionType: string, fileName: string, data: object) => {
      const dir = getLibDir(collectionType);
      if (!existsSync(dir)) await mkdir(dir, { recursive: true });
      const filePath = join(dir, fileName);
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    }
  );

  // Delete a lib file
  ipcMain.handle('lib:deleteFile', async (_, collectionType: string, fileName: string) => {
    const filePath = join(getLibDir(collectionType), fileName);
    if (existsSync(filePath)) await unlink(filePath);
    return true;
  });

  // Export lib file (save dialog)
  ipcMain.handle('lib:exportFile', async (_, collectionType: string, fileName: string) => {
    const srcPath = join(getLibDir(collectionType), fileName);
    if (!existsSync(srcPath)) return false;
    const result = await dialog.showSaveDialog({
      defaultPath: fileName,
      filters: [{ name: 'TileMap Lib', extensions: ['tilemap', 'json'] }]
    });
    if (result.canceled || !result.filePath) return false;
    const content = await readFile(srcPath, 'utf-8');
    await writeFile(result.filePath, content, 'utf-8');
    return true;
  });

  // Import lib file (open dialog) into a collection type
  ipcMain.handle('lib:importFile', async (_, collectionType: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'TileMap Lib', extensions: ['tilemap', 'json'] }]
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    const srcPath = result.filePaths[0];
    const fileName = srcPath.split(/[\\/]/).pop()!;
    const dir = getLibDir(collectionType);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    const destPath = join(dir, fileName);
    const content = await readFile(srcPath, 'utf-8');
    await writeFile(destPath, content, 'utf-8');
    return { fileName, data: JSON.parse(content) };
  });
}
