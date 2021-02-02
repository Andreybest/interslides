import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  closeWindow: () => {
    ipcRenderer.send('close-presentation-window');
  },
});
