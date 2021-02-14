import {
  app, BrowserWindow, ipcMain, dialog, Menu, autoUpdater, Notification,
} from 'electron';
import * as isDev from 'electron-is-dev';
import WebServer from './WebServer';
import Archive from './Archive';
import removeDirectory from './removeDirectory';
import copyFolder from './copyFolder';
import fillHtmlFile from './fillHtmlFile';
import copyFiles from './copyFiles';
import { join } from 'path';

const TEMP_FOLDER_NAME = 'interslides';
const TEMP_PRESENTATION_FOLDER_NAME = 'presentation';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const UPDATE_SERVER = 'https://interslides-update-server.vercel.app/';
const updateFeed = `${UPDATE_SERVER}/update/${process.platform}/${app.getVersion()}`;

// Update only Win application, linux users have package managers to take care of updating better. 
if (!isDev && process.platform === 'win32') {
  autoUpdater.setFeedURL({ url: updateFeed });

  autoUpdater.once('update-available', () => {
    const notification = new Notification({ title: 'InterSlides New Update!', body: 'New update is available and it\'s being downloaded now!' });
    notification.show();
  });

  autoUpdater.on('error', (error) => {
    dialog.showMessageBox(slideCreationWindow ? slideCreationWindow : mainWindow!, { 
      title: 'InterSlides Failed To Update!',
      type: 'error',
      message: 'InterSlides encountered an error while trying to update.',
      detail: error.message,
    });
  });

  autoUpdater.once('update-downloaded', async (_event, _releaseNotes, releaseName, _releaseDate, _updateURL) => {
    // on win32 only releaseName is available
    const messageBox = await dialog.showMessageBox(slideCreationWindow ? slideCreationWindow : mainWindow!, { 
      title: 'New Update Available!',
      type: 'info',
      message: 'New update for InterSlides is available, would you like to install it now?',
      detail: `Release: ${releaseName}`,
      buttons: ['Install now', 'Install later'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    });
    if (messageBox.response === 0) autoUpdater.quitAndInstall();
  });
}

let mainWindow: BrowserWindow | undefined;
let slideCreationWindow: BrowserWindow | undefined;
let presentationWindow: BrowserWindow | undefined;
let settingsWindow: BrowserWindow | undefined;

let appPath: string;
let tempFolderPath: string;
let tempPresentationFolderPath: string;
let tempLocalHtmlFilePath: string;
let tempRemoteHtmlFilePath: string;
let tempRemoteIframeFilePath: string;

let server: WebServer;


function removeTempFiles() {
  removeDirectory(tempFolderPath);
}


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
      preload: join(appPath, '/dist/preloaders/index.js'),
    },
  });

  mainWindow.loadURL(`file://${appPath}/public/menu/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

function createSlideCreationWindow(): void {
  slideCreationWindow = new BrowserWindow({
    width: 1200,
    minWidth: 800,
    height: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(appPath, '/dist/preloaders/slideCreator.js'),
    },
  });

  slideCreationWindow.loadURL(`file://${appPath}/public/slideCreator/slideCreator.html`);

  slideCreationWindow.center();

  // slideCreationWindow.maximize();

  slideCreationWindow.on('close', () => {
    removeTempFiles();
    if (mainWindow) mainWindow.show();
    slideCreationWindow = undefined;
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
      preload: join(appPath, '/dist/preloaders/presentationLocal.js'),
    },
  });

  presentationWindow.loadURL(`file://${appPath}/public/presentationLocal/presentationLocal.html`);

  presentationWindow.on('close', () => {
    server.closeWebServer();
    if (slideCreationWindow) {}
    else if (mainWindow) mainWindow.show();
    presentationWindow = undefined;
  });
}

function createSettingsWindow(): void {
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(appPath, '/dist/preloaders/settings.js'),
    }
  });

  settingsWindow.loadURL(`file://${appPath}/public/settings/index.html`);

  settingsWindow.on('close', () => {
    settingsWindow = undefined;
  })
}


app.on('ready', () => {
  appPath = app.getAppPath();
  tempFolderPath = join(app.getPath('temp'), `/${TEMP_FOLDER_NAME}`);
  tempPresentationFolderPath = join(tempFolderPath, `/${TEMP_PRESENTATION_FOLDER_NAME}`);
  tempRemoteIframeFilePath = join(tempFolderPath, 'presentationRemote.html');
  tempRemoteHtmlFilePath = join(tempPresentationFolderPath, Archive.remoteFileName);
  tempLocalHtmlFilePath = join(tempPresentationFolderPath, Archive.localFileName);
  
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
  await copyFolder(join(appPath, '/public/presentationRemote'), tempFolderPath);
}

function copyMainTemplateFilesToTempFolder() {
  return copyFiles(
    [join(appPath, '/public/slides-template/local.html'), tempLocalHtmlFilePath],
    [join(appPath, '/public/slides-template/remote.html'), tempRemoteHtmlFilePath]
  );
}

ipcMain.on('new-file', async () => {
  if (mainWindow) {
    removeTempFiles();
    await copyFolder(join(appPath, '/public/slides-template'), tempPresentationFolderPath);
    mainWindow.hide();
    createSlideCreationWindow();
  }
});

ipcMain.on('open-file', async () => {
  if (mainWindow) {
    const file = await openFile(mainWindow, [
      { name: 'InterSlides file', extensions: ['is'] },
    ]);
    if (file.filePaths.length > 0) {
      try {
        removeTempFiles();
        const archive = new Archive();
        await archive.loadFile(file.filePaths[0]);
        await archive.unpackToFolder(tempPresentationFolderPath);
        await loadRemoteTempFiles();

        server = new WebServer();
        server.createWebServer({
          remoteHtmlLink: tempRemoteHtmlFilePath,
          remoteIframeLink: tempRemoteIframeFilePath,
          localHtmlLink: tempLocalHtmlFilePath,
        });

        createPresentationWindow();
      } catch (error) {
        dialog.showMessageBox(mainWindow, { message: (error as Error).message });
      }
    }
  }
});

ipcMain.on('open-settings', () => {
  if (settingsWindow) return settingsWindow.show();
  createSettingsWindow();
});

ipcMain.on('save-as', async (_, slides: [Map<number, string>, Map<number, string>]) => {
  const path = await dialog.showSaveDialog({
    filters: [
      { name: 'InterSlides file', extensions: ['is'] },
    ],
    defaultPath: 'slides.is',
  });

  if (path.canceled) return;

  await copyMainTemplateFilesToTempFolder();
  fillHtmlFile(tempLocalHtmlFilePath, slides[0]);
  fillHtmlFile(tempRemoteHtmlFilePath, slides[1]);
  await Archive.saveFolderAsArchive(tempPresentationFolderPath, path.filePath as string);
});

ipcMain.on('preview-presentation', async (_, slides: [Map<number, string>, Map<number, string>]) => {
  await copyMainTemplateFilesToTempFolder();
  fillHtmlFile(tempLocalHtmlFilePath, slides[0]);
  fillHtmlFile(tempRemoteHtmlFilePath, slides[1]);
  await loadRemoteTempFiles();

  try {
    server = new WebServer();
    server.createWebServer({
      remoteHtmlLink: tempRemoteHtmlFilePath,
      remoteIframeLink: tempRemoteIframeFilePath,
      localHtmlLink: tempLocalHtmlFilePath,
    });

    createPresentationWindow();
  } catch (error) {
    dialog.showMessageBox(mainWindow as BrowserWindow, { message: (error as Error).message });
  }
});

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
});

ipcMain.on('close-presentation-window', () => presentationWindow?.close());

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    removeTempFiles();
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === undefined) {
    createWindow();
  }
});

process.on('uncaughtException', (error) => {
  dialog.showMessageBox(mainWindow as BrowserWindow, { message: (error as Error).message, type: 'error' });
});

process.on('unhandledRejection', (error) => {
  dialog.showMessageBox(mainWindow as BrowserWindow, { message: (error as Error).message, type: 'error' });
});
