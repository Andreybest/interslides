document.getElementById('open').onclick = (event) => {
  event.preventDefault();
  window.postMessage({ message: 'open-presentation' }, '*');
};
