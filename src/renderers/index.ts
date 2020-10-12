const buttonNew = document.getElementById('new');
const buttonOpen = document.getElementById('open');

if (buttonNew) {
  buttonNew.onclick = (event) => {
    event.preventDefault();
    (window as any).api.newFile();
  };
}

if (buttonOpen) {
  buttonOpen.onclick = (event) => {
    event.preventDefault();
    (window as any).api.openFile();
  };
}
