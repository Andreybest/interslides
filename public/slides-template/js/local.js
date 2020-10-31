$(document).keydown((event) => {
  if (event.key === 'ArrowRight') {
    $('#carousel').slick('slickNext');
    window.parent.postMessage('next-slide', '*');
  } else if (event.key === 'ArrowLeft') {
    $('#carousel').slick('slickPrev');
    window.parent.postMessage('previous-slide', '*');
  }

  window.parent.keydown(event);
});
