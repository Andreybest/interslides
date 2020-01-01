const buttonOpen = document.getElementById('open');
if (buttonOpen) {
  buttonOpen.onclick = (event) => {
    event.preventDefault();
    window.postMessage({ message: 'open-file' }, '*');
  };
}
