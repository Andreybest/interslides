async function loadIframe() {
  const localPath = await (await fetch('http://localhost:80/localPath')).text();
  const iframeElement = document.createElement('iframe');
  iframeElement.setAttribute('src', localPath);
  document.getElementsByTagName('body')[0].appendChild(iframeElement);
  if (iframeElement.contentWindow) iframeElement.contentWindow.focus();
}

// eslint-disable-next-line no-unused-vars
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    (window as any).api.closeWindow();
  }
}

let socket: SocketIOClient.Socket;

function connectToIO() {
  // eslint-disable-next-line no-undef
  socket = io.connect('http://localhost:80');
}

function createMessageEventsRecivers() {
  window.addEventListener('message', (event: MessageEvent) => {
    socket.emit('message', event.data);
  });
}

connectToIO();
loadIframe();
createMessageEventsRecivers();
