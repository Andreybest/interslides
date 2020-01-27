import { ipcRenderer } from 'electron';

(window as any).api = {};

(window as any).api.closeWindow = () => {
  ipcRenderer.send('close-presentation-window');
};
