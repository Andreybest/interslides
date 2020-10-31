import { ipcRenderer } from 'electron';

(window as any).api = {};

(window as any).api.saveAs = (slidesLocal: Map<number, string>, slidesRemote: Map<number, string>) => {
  ipcRenderer.send('save-as', [slidesLocal, slidesRemote]);
};
