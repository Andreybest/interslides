import { ipcRenderer } from 'electron';

(window as any).api = {};

(window as any).api.saveAs = (slidesLocal: Map<number, string>, slidesRemote: Map<number, string>) => {
  ipcRenderer.send('save-as', [slidesLocal, slidesRemote]);
};

(window as any).api.addImage = () => {
  ipcRenderer.send('add-image');
}

(window as any).api.onAddImage = (listener: (imagePath: string) => any) => {
  ipcRenderer.on('add-image', (_, ...args) => listener(args[0]));
}
