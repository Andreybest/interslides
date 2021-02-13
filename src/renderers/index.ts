const buttonNew = document.getElementById('new') as HTMLElement;
const buttonOpen = document.getElementById('open') as HTMLElement;
const buttonSettings = document.getElementById('settings') as HTMLElement;

buttonNew.onclick = (event) => {
  event.preventDefault();
  (window as any).api.newFile();
};

buttonOpen.onclick = (event) => {
  event.preventDefault();
  (window as any).api.openFile();
};

buttonSettings.onclick = (event) => {
  event.preventDefault();
  (window as any).api.openSettings();
};
