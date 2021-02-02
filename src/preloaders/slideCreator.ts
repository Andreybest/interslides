import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  saveAs: (slidesLocal: Map<number, string>, slidesRemote: Map<number, string>) => {
    ipcRenderer.send('save-as', [slidesLocal, slidesRemote]);
  },
  addImage: () => {
    ipcRenderer.send('add-image');
  },
  onAddImage: (listener: (imagePath: string) => any) => {
    ipcRenderer.on('add-image', (_, ...args) => listener(args[0]));
  },
  toggleDevTools: () => {
    ipcRenderer.send('toggle-devtools');
  },
  previewPresentation: (slidesLocal: Map<number, string>, slidesRemote: Map<number, string>) => {
    ipcRenderer.send('preview-presentation', [slidesLocal, slidesRemote]);
  },
});
