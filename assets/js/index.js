document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.productos-grid .producto-card'));
  const filtroBtns = Array.from(document.querySelectorAll('.filtros .filtro-btn'));
  const buscador = document.getElementById('buscador');

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
});

