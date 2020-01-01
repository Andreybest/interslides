import { ipcRenderer } from 'electron';

process.once('loaded', () => {
  window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.message === 'create-web-server') {
      ipcRenderer.send('create-web-server');
    }
  });
});
