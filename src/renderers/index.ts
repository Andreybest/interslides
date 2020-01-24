const buttonOpen = document.getElementById('open');
if (buttonOpen) {
  buttonOpen.onclick = (event) => {
    event.preventDefault();
    (window as any).api.openFile();
  };
}
