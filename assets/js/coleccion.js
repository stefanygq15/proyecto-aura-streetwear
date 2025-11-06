document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('coleccion-grid');
  if (!grid) return;
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('search') || '').toLowerCase().trim();
  let items = [];
  try {
    if (window.fetchProducts) items = await window.fetchProducts({ search: q });
  } catch(e){}
  if (!items || !items.length) items = (window.PRODUCTS_FALLBACK || []);
  const list = items.filter(p => !q || p.title.toLowerCase().includes(q));
  grid.innerHTML = list.length ? list.map(p => card(p)).join('') : '<p style="opacity:.8">Sin resultados.</p>';

  function currency(v){ return `$${(v||0).toLocaleString()}`; }
  function card(p){
    return `
    <div class="producto-card" data-genero="${p.gender}">
      <div class="producto-imagen-contenedor">
        <img src="${p.image}" class="producto-imagen" alt="${p.title}">
        <div class="producto-acciones">
          <button class="accion-btn" aria-label="Favorito"><i class="far fa-heart"></i></button>
          <button class="accion-btn" aria-label="Vista rápida"><i class="fas fa-search"></i></button>
        </div>
      </div>
      <div class="producto-info">
        <h3 class="producto-titulo">${p.title}</h3>
        <p class="producto-precio">${currency(p.price)}</p>
        <div class="producto-tallas">
          <button class="talla-btn activa">M</button>
          <button class="talla-btn">L</button>
        </div>
        <button class="btn-carrito" data-title="${p.title}" data-price="${p.price}" data-image="${p.image}">Añadir al carrito <i class="fas fa-shopping-bag"></i></button>
      </div>
    </div>`;
  }
});
