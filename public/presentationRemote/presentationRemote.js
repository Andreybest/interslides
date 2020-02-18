function focusOnIframe() {
  document.getElementsByTagName('iframe')[0].focus();
}

let socket;

function connectToIO() {
  // eslint-disable-next-line no-undef
  socket = io.connect();
}

function createMessagePosters() {
  socket.on('message', (data) => {
    document.getElementsByTagName('iframe')[0].contentWindow.postMessage(data, '*');
  });
}

focusOnIframe();
connectToIO();
createMessagePosters();
