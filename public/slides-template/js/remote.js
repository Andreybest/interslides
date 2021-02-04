window.addEventListener('message', (event) => {
  if (event.data === 'next-slide') {
    // eslint-disable-next-line no-undef
    Reveal.right();
  } else if (event.data === 'previous-slide') {
    // eslint-disable-next-line no-undef
    Reveal.left();
  }
});
