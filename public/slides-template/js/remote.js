window.addEventListener('message', (event) => {
  if (event.data === 'next-slide') {
    $('#carousel').slick('slickNext');
  } else if (event.data === 'previous-slide') {
    $('#carousel').slick('slickPrev');
  }
});
