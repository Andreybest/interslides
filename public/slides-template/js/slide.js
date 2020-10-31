$('#carousel').slick({
  dots: false,
  infinite: true,
  speed: 300,
  slidesToShow: 1,
  adaptiveHeight: true,
  arrows: false,
  accessibility: false,
});

window.onresize = () => {
  const carousel = document.getElementById('carousel');
  carousel.style.fontSize = `${carousel.clientWidth / 100}px`;
};
