// eslint-disable-next-line no-undef
Reveal.initialize({
  controls: false,
  keyboard: false,
  embedded: true,
  disableLayout: true,
});

const slidesWrapper = document.getElementsByClassName('reveal')[0];

const resizeFont = () => {
  slidesWrapper.style.fontSize = `${slidesWrapper.clientWidth / 100}px`;
};

window.onresize = resizeFont;

resizeFont();
