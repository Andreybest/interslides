import {
  app, BrowserWindow, ipcMain, dialog, Menu,
} from 'electron';
import WebServer from './WebServer';
import Archive from './Archive';
import removeDirectory from './removeDirectory';
import copyFolder from './copyFolder';
import fillHtmlFile from './fillHtmlFile';
import copyFiles from './copyFiles';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow | null;
let slideCreationWindow: BrowserWindow | null;
let presentationWindow: BrowserWindow | null;

let appPath: string;

let server: WebServer;

const tempFolderName = 'interslides';
const tempPresentationFolderName = 'presentation';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 600,
    maxWidth: 900,
    minWidth: 400,
    height: 800,
    maxHeight: 1200,
    minHeight: 550,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${appPath}/dist/preloaders/index.js`,
    },
  });

  mainWindow.loadURL(`file://${appPath}/public/menu/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function removeTempFiles() {
  removeDirectory(`${app.getPath('temp')}/${tempFolderName}`);
}

function createSlideCreationWindow(): void {
  if (mainWindow) mainWindow.hide();

  slideCreationWindow = new BrowserWindow({
    width: 1200,
    minWidth: 800,
    height: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${appPath}/dist/preloaders/slideCreator.js`,
    },
  });

  slideCreationWindow.loadURL(`file://${appPath}/public/slideCreator/slideCreator.html`);

  slideCreationWindow.center();

  // slideCreationWindow.maximize();

  slideCreationWindow.on('close', () => {
    removeTempFiles();
    if (mainWindow) mainWindow.show();
  });
}

function createPresentationWindow(): void {
  if (mainWindow) mainWindow.hide();

  presentationWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    frame: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${appPath}/dist/preloaders/presentationLocal.js`,
    },
  });

  presentationWindow.loadURL(`file://${appPath}/public/presentationLocal/presentationLocal.html`);

  presentationWindow.on('close', () => {
    server.closeWebServer();
    removeTempFiles();
    if (slideCreationWindow) {}
    else if (mainWindow) mainWindow.show();
  });
}

app.on('ready', () => {
  appPath = app.getAppPath();
  Menu.setApplicationMenu(null);
  createWindow();
});

function openFile(window: BrowserWindow, filters?: Electron.FileFilter[]): Promise<Electron.OpenDialogReturnValue> {
  return dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: filters,
  });
}

async function loadRemoteTempFiles(): Promise<void> {
  await copyFolder(`${appPath}/public/presentationRemote`, `${app.getPath('temp')}/${tempFolderName}`);
}

ipcMain.on('new-file', async () => {
  if (mainWindow) {
    removeTempFiles();
    await copyFolder(`${appPath}/public/slides-template`, `${app.getPath('temp')}/${tempFolderName}/presentation`);
    createSlideCreationWindow();
  }
});

ipcMain.on('open-file', async () => {
  if (mainWindow) {
    const file = await openFile(mainWindow, [
      { name: 'InterSlides file', extensions: ['is'] },
    ]);
    if (file.filePaths.length > 0) {
      const tempFolder = `${app.getPath('temp')}/${tempFolderName}`;
      try {
        removeTempFiles();
        const archive = new Archive();
        await archive.loadFile(file.filePaths[0]);
        await archive.unpackToFolder(`${tempFolder}/${tempPresentationFolderName}`);
        await loadRemoteTempFiles();
      } catch (error) {
        dialog.showMessageBox(mainWindow, { message: (error as Error).message });
      }

      createPresentationWindow();

      try {
        server = new WebServer();
        server.createWebServer(`${tempFolder}/${tempPresentationFolderName}/${Archive.remoteFileName}`, `${tempFolder}/presentationRemote.html`, `${tempFolder}/${tempPresentationFolderName}/${Archive.localFileName}`);
      } catch (error) {
        dialog.showMessageBox(mainWindow, { message: (error as Error).message });
      }
    }
  }
});

ipcMain.on('save-as', async (_, slides: [Map<number, string>, Map<number, string>]) => {
  const path = await dialog.showSaveDialog({
    filters: [
      { name: 'InterSlides file', extensions: ['is'] },
    ],
    defaultPath: 'slides.is',
  });

  if (path.canceled) return;

  const tempFolder = `${app.getPath('temp')}/${tempFolderName}/presentation`;
  await copyFiles([`${appPath}/public/slides-template/local.html`, `${tempFolder}/local.html`], [`${appPath}/public/slides-template/remote.html`, `${tempFolder}/remote.html`]);
  fillHtmlFile(`${tempFolder}/local.html`, slides[0]);
  fillHtmlFile(`${tempFolder}/remote.html`, slides[1]);
  await Archive.saveFolderAsArchive(tempFolder, path.filePath as string);
});

ipcMain.on('preview-presentation', async (_, slides: [Map<number, string>, Map<number, string>]) => {
  await copyFolder(`${appPath}/public/slides-template`, `${app.getPath('temp')}/${tempFolderName}/presentation`);
  const tempFolder = `${app.getPath('temp')}/${tempFolderName}`;
  const presentationFolder = `${tempFolder}/presentation`;
  await copyFiles([`${appPath}/public/slides-template/local.html`, `${presentationFolder}/local.html`], [`${appPath}/public/slides-template/remote.html`, `${presentationFolder}/remote.html`]);
  fillHtmlFile(`${presentationFolder}/local.html`, slides[0]);
  fillHtmlFile(`${presentationFolder}/remote.html`, slides[1]);
  await loadRemoteTempFiles();

  try {
    server = new WebServer();
    server.createWebServer(`${presentationFolder}/${Archive.remoteFileName}`, `${tempFolder}/presentationRemote.html`, `${presentationFolder}/${Archive.localFileName}`);
  } catch (error) {
    dialog.showMessageBox(mainWindow as BrowserWindow, { message: (error as Error).message });
  }

  createPresentationWindow();
})

ipcMain.on('add-image', async (event) => {
  const image = await openFile(slideCreationWindow as BrowserWindow, [
    { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
    { name: 'PNG', extensions: ['png'] },
  ]);
  
  if (image.filePaths.length > 0) {
    event.sender.send('add-image', image.filePaths[0]);
  }
});

ipcMain.on('toggle-devtools', async () => {
  slideCreationWindow?.webContents.toggleDevTools();
})

ipcMain.on('close-presentation-window', () => presentationWindow?.close());

app.on('window-all-closed', () => {
  removeTempFiles();
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

process.on('uncaughtException', (error) => {
  dialog.showMessageBox(mainWindow as BrowserWindow, { message: (error as Error).message, type: 'error' });
})

process.on('unhandledRejection', (error) => {
  dialog.showMessageBox(mainWindow as BrowserWindow, { message: (error as Error).message, type: 'error' });
})
