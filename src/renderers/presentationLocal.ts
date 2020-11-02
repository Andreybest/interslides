
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

async function createQrCode() {
  const result = await fetch('http://localhost:80/localIp');
  if (result.status === 404) {
    const header = qrCodeModal.getElementsByTagName('h1')[0] as HTMLHeadingElement;
    header.innerHTML = 'Looks like InterSlides failed to find local IP.<br>This can be due to unconnected ethernet or wi-fi on this device<br>Please, try again or try finding manually presenters ip on this wi-fi!';
    return;
  }

  const localIp = await result.text();
  const qrCodeCanvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
  // @ts-ignore
  // eslint-disable-next-line no-undef
  QRCode.toCanvas(qrCodeCanvas, localIp);
  qrCodeModal.style.display = 'block';
}

const qrCodeModal = document.getElementsByClassName('qr-code-modal')[0] as HTMLDivElement;

// Get the <span> element that closes the modal
const qrCodeModalCloseButton = document.getElementsByClassName('qr-code-modal-close-button')[0] as HTMLSpanElement;

qrCodeModalCloseButton.onclick = () => {
  qrCodeModal.style.display = 'none';
};

window.onclick = (event: MouseEvent) => {
  if (event.target === qrCodeModal) {
    qrCodeModal.style.display = 'none';
  }
};

connectToIO();
loadIframe();
createMessageEventsRecivers();
createQrCode();
