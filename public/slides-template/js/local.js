document.onkeydown = (event) => {
  event.preventDefault();
  if (event.key === 'ArrowRight') {
    Reveal.right();
    window.parent.postMessage('next-slide', '*');
  } else if (event.key === 'ArrowLeft') {
    Reveal.left();
    window.parent.postMessage('previous-slide', '*');
  }

  window.parent.keydown(event);
};
