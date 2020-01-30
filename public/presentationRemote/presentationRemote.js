function focusOnIframe() {
  document.getElementsByTagName('iframe')[0].focus();
}

let socket;

function connectToIO() {
  // eslint-disable-next-line no-undef
  socket = io.connect('http://localhost:80');
}

function createMessagePosters() {
  socket.on('message', (data) => {
    document.getElementsByTagName('iframe')[0].contentWindow.postMessage(data, '*');
  });
}

focusOnIframe();
connectToIO();
createMessagePosters();
