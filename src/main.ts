import {
  app, BrowserWindow, ipcMain, dialog, Menu,
} from 'electron';
import WebServer from './WebServer';
import Archive from './Archive';
import removeDirectory from './removeDirectory';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow | null;

let server: WebServer;

const tempFolderName = 'interslides';

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
    },
  });

  mainWindow.loadURL(`file://${__dirname}/../public/menu/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function removeTempFiles() {
  removeDirectory(`${app.getPath('temp')}/${tempFolderName}`);
}

function createPresentationWindow(htmlLink: string): void {
  const newWindow: BrowserWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: `${__dirname}/../dist/preloaders/presentation.js`,
    },
  });

  newWindow.loadURL(htmlLink);

  newWindow.on('close', () => {
    server.closeWebServer();
    removeTempFiles();
    createWindow();
  });

  if (mainWindow) {
    mainWindow.close();
    mainWindow = Object.assign(Object.create(Object.getPrototypeOf(newWindow)), newWindow);
  }
}

app.on('ready', () => {
  Menu.setApplicationMenu(null);
  createWindow();
});

function openFile(window: BrowserWindow): Promise<Electron.OpenDialogReturnValue> {
  return dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: [
      { name: 'InterSlides file', extensions: ['is'] },
    ],
  });
}

ipcMain.on('open-file', async () => {
  if (mainWindow) {
    const file = await openFile(mainWindow);
    if (file.filePaths.length > 0) {
      const tempFolder = `${app.getPath('temp')}/${tempFolderName}`;
      try {
        const archive = new Archive();
        await archive.loadFile(file.filePaths[0]);
        await archive.unpackToFolder(tempFolder);
      } catch (error) {
        dialog.showMessageBox(mainWindow, { message: (error as Error).message });
      }

      createPresentationWindow(`${tempFolder}/${Archive.localFileName}`);

      try {
        server = new WebServer();
        server.createWebServer(`${tempFolder}/${Archive.remoteFileName}`);
      } catch (error) {
        dialog.showMessageBox(mainWindow, { message: (error as Error).message });
      }
    }
  }
});

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
