import { ipcRenderer } from 'electron';

(window as any).api = {};

(window as any).api.openFile = () => {
  ipcRenderer.send('open-file');
};
