document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('coleccion-grid');
  const main = document.querySelector('.main-catalogo');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const searchTerm = (params.get('search') || '').toLowerCase().trim();
  let categoriaSeleccionada = params.get('categoria') || 'todos';
  let items = [];

  const allowDemo = (typeof window.allowDemoProducts === 'function' && window.allowDemoProducts());
  try {
    if (window.fetchProducts) items = await window.fetchProducts({ search: searchTerm });
  } catch (e) { /* se usa fallback si la API falla */ }

  if (!items || !items.length) {
    if (allowDemo) {
      items = (window.PRODUCTS_FALLBACK || []);
    } else {
      grid.innerHTML = '<p style="opacity:.8">No pudimos cargar los productos desde la base de datos.</p>';
      return;
    }
  }

  crearFiltros(items);
  aplicarFiltros();

  function crearFiltros(lista) {
    let barra = document.getElementById('coleccion-filtros');
    if (!barra) {
      barra = document.createElement('div');
      barra.id = 'coleccion-filtros';
      barra.className = 'barra-filtros';
      if (main) main.insertBefore(barra, grid);
    } else {
      barra.classList.add('barra-filtros');
    }

    const categorias = Array.from(new Set(lista.map(p => p.category || p.type).filter(Boolean)));
    barra.innerHTML = `
      <div class="filtro-wrapper">
        <i class="fas fa-filter filtro-icono"></i>
        <select id="coleccionFilterCategory" class="filtro-select" aria-label="Filtrar por categoria">
          <option value="todos">Todas las categorias</option>
          ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
        <i class="fas fa-chevron-down filtro-chevron"></i>
      </div>
    `;

    const select = barra.querySelector('#coleccionFilterCategory');
    if (select) {
      select.value = categorias.includes(categoriaSeleccionada) ? categoriaSeleccionada : 'todos';
      categoriaSeleccionada = select.value;
      select.addEventListener('change', (e) => {
        categoriaSeleccionada = e.target.value;
        aplicarFiltros();
      });
    }
  }

  function aplicarFiltros() {
    const lista = items.filter(p => {
      const coincideBusqueda = !searchTerm || (p.title || '').toLowerCase().includes(searchTerm);
      const categoria = p.category || p.type || '';
      const coincideCategoria = categoriaSeleccionada === 'todos' || categoria === categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
    grid.innerHTML = lista.length ? lista.map(p => card(p)).join('') : '<p style="opacity:.8">Sin resultados.</p>';
  }

  function currency(v) { return `$${(v || 0).toLocaleString()}`; }
  function card(p) {
    const productId = p.id || p.slug || '';
    const productSlug = p.slug || p.id || '';
    const image = p.image || 'assets/images/placeholder.png';
    const categoria = p.category || p.type || '';
    return `
    <div class="producto-card" data-genero="${p.gender || ''}" data-product-id="${productId}" data-product-slug="${productSlug}" data-category="${categoria}" data-type="${p.type || ''}">
      <div class="producto-imagen-contenedor">
        <img src="${image}" class="producto-imagen" alt="${p.title}">
        <div class="producto-acciones">
          <button class="accion-btn" aria-label="Favorito"><i class="far fa-heart"></i></button>
          <button class="accion-btn" aria-label="Vista rapida"><i class="fas fa-search"></i></button>
        </div>
      </div>
      <div class="producto-info">
        <h3 class="producto-titulo">${p.title}</h3>
        <p class="producto-precio">${currency(p.price)}</p>
        <div class="producto-tallas">
          <button class="talla-btn">S</button>
          <button class="talla-btn activa">M</button>
          <button class="talla-btn">L</button>
          <button class="talla-btn">XL</button>
          <button class="talla-btn">XXL</button>
        </div>
        <button class="btn-carrito" data-product-id="${productId}" data-product-slug="${productSlug}" data-title="${p.title}" data-price="${p.price}" data-image="${image}">Anadir al carrito <i class="fas fa-shopping-bag"></i></button>
      </div>
    </div>`;
  }
});
