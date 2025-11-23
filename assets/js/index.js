document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.productos-grid .producto-card'));
  const filtroBtns = Array.from(document.querySelectorAll('.filtros .filtro-btn'));
  const buscador = document.getElementById('buscador');
  const slider = document.getElementById('homeSlider');
  const heroBgTrack = document.querySelector('.hero .hero-bg-track');
  const heroPrev = document.querySelector('.hero .hero-arrow.prev');
  const heroNext = document.querySelector('.hero .hero-arrow.next');

  let genero = 'todos';
  let query = '';

  function normaliza(t) { return (t || '').toLowerCase().trim(); }

  function aplicaFiltros() {
    const q = normaliza(query);
    cards.forEach(card => {
      const g = (card.dataset.genero || '').toLowerCase();
      const nombre = normaliza(card.querySelector('.producto-titulo')?.textContent);
      const matchGenero = genero === 'todos' || g === genero;
      const matchTexto = !q || nombre.includes(q);
      card.style.display = matchGenero && matchTexto ? '' : 'none';
    });
  }

  filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filtroBtns.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      if (btn.textContent.includes('Hombres')) genero = 'hombres';
      else if (btn.textContent.includes('Mujeres')) genero = 'mujeres';
      else genero = 'todos';
      aplicaFiltros();
    });
  });

  if (buscador) {
    buscador.addEventListener('input', (e) => {
      query = e.target.value;
      aplicaFiltros();
    });
  }

  // Slider de fondo del hero (independiente)
  if (heroBgTrack) {
    const bgSlides = Array.from(heroBgTrack.querySelectorAll('.bg-slide'));
    let bgCurrent = 0;
    let bgTimer = null;

    const goToBg = (idx) => {
      bgCurrent = (idx + bgSlides.length) % bgSlides.length;
      bgSlides.forEach((s, i) => s.classList.toggle('active', i === bgCurrent));
      restartBgTimer();
    };

    const nextBg = () => goToBg(bgCurrent + 1);
    const prevBg = () => goToBg(bgCurrent - 1);

    const restartBgTimer = () => {
      if (bgTimer) clearInterval(bgTimer);
      bgTimer = setInterval(nextBg, 6000);
    };

    goToBg(0);
    restartBgTimer();

    if (heroNext) heroNext.addEventListener('click', nextBg);
    if (heroPrev) heroPrev.addEventListener('click', prevBg);
  }

  // Slider principal de la seccion hero-slider
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');
    const dotsBox = slider.querySelector('.slider-dots');
    let current = 0;
    let timer = null;

    function buildDots() {
      dotsBox.innerHTML = '';
      slides.forEach((_, idx) => {
        const btn = document.createElement('button');
        if (idx === current) btn.classList.add('active');
        btn.addEventListener('click', () => goTo(idx));
        dotsBox.appendChild(btn);
      });
    }

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('active', i === current));
      restartTimer();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restartTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    buildDots();
    goTo(0);
    restartTimer();

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    slider.addEventListener('mouseenter', () => timer && clearInterval(timer));
    slider.addEventListener('mouseleave', restartTimer);
  }
});
