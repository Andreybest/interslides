import {
  app, BrowserWindow, ipcMain, dialog,
} from 'electron';
import WebServer from './webServer';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow | null;

let server: WebServer;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 600,
    maxWidth: 900,
    minWidth: 400,
    height: 800,
    maxHeight: 1200,
    minHeight: 550,
    webPreferences: {
      preload: `${__dirname}/../dist/preloaders/index.js`,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/../public/menu/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createPresentationWindow(htmlLink: string): void {
  const newWindow: BrowserWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: `${__dirname}/../dist/preloaders/presentation.js`,
      contextIsolation: true,
    },
  });

  newWindow.loadURL(htmlLink);

  newWindow.on('close', () => {
    server.closeWebServer();
    createWindow();
  });

  if (mainWindow) {
    mainWindow.close();
    mainWindow = Object.assign(Object.create(Object.getPrototypeOf(newWindow)), newWindow);
  }
}

app.on('ready', () => {
  createWindow();
});

function openFile(window: BrowserWindow): Promise<Electron.OpenDialogReturnValue> {
  return dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: [
      { name: 'HTML page', extensions: ['html', 'htm'] },
    ],
  });
}

ipcMain.on('open-file', async () => {
  if (mainWindow) {
    const file = await openFile(mainWindow);
    if (file.filePaths.length > 0) {
      createPresentationWindow(file.filePaths[0]);
      server = new WebServer();
      server.createWebServer(file.filePaths[0]);
    }
  }
});

app.on('window-all-closed', () => {
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
