import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  openFile: () => {
    ipcRenderer.send('open-file');
  },
  newFile: () => {
    ipcRenderer.send('new-file');
  },
});
