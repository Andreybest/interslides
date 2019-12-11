import { ipcRenderer } from "electron";

process.once('loaded', () => {
  window.addEventListener('message', event => {
    const message = event.data;

    if (message.message === 'open-presentation') {
      ipcRenderer.send('open-presentation');
    }
  });
});