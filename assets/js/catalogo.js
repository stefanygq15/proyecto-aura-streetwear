document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }

  const filtroSelects = document.querySelectorAll('.filtro-select');
  const buscarInput = document.getElementById('buscar-catalogo');
  let wishlistSet = new Set();
  let wishlistLoaded = false;
  let catalogData = [];
  let categoriaSeleccionada = 'todos';
  let renderLista = () => { };

  // Bindear filtros existentes (si los hay en HTML) y luego añadiremos el selector de categoría
  filtroSelects.forEach(select => select.addEventListener('change', aplicarFiltros));
  if (buscarInput) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) { buscarInput.value = q; }
    buscarInput.addEventListener('input', aplicarFiltros);
  }

  document.addEventListener('click', function (e) {
    const talla = e.target.closest('.talla-btn');
    if (!talla) return;
    const card = talla.closest('.producto-card');
    if (!card) return;
    card.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('activa'));
    talla.classList.add('activa');
  });

  document.addEventListener('click', async function (e) {
    const accion = e.target.closest('.accion-btn');
    if (!accion) return;
    const icon = accion.querySelector('i');
    if (!icon) return;
    if (icon.classList.contains('fa-heart')) {
      const card = accion.closest('.producto-card');
      const slug = card?.dataset?.productSlug || card?.dataset?.productId || '';
      if (!slug) return;
      try {
        const ok = await toggleWishlist(slug);
        if (!ok) return;
        const active = wishlistSet.has(slug);
        icon.classList.toggle('fas', active);
        icon.classList.toggle('far', !active);
        icon.style.color = active ? 'var(--rojo-neon)' : '';
        mostrarNotificacion(active ? 'Agregado a favoritos' : 'Removido de favoritos');
      } catch (err) {
        mostrarNotificacion(err.message || 'No se pudo actualizar la lista');
      }
    } else if (icon.classList.contains('fa-search')) {
      const card = accion.closest('.producto-card');
      const titulo = card.querySelector('.producto-titulo')?.textContent?.trim();
      const precioTxt = card.querySelector('.producto-precio')?.textContent?.trim();
      const img = card.querySelector('.producto-imagen')?.getAttribute('src');
      abrirModalVistaRapida({ titulo, precioTxt, img });
    }
  });

  const carritoBtns = document.querySelectorAll('.btn-carrito');
  carritoBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const producto = this.closest('.producto-card');
      const titulo = producto.querySelector('.producto-titulo').textContent.trim();
      const precioTxt = producto.querySelector('.producto-precio').textContent.trim();
      const img = producto.querySelector('.producto-imagen')?.getAttribute('src');
      const tallaActiva = producto.querySelector('.talla-btn.activa')?.textContent?.trim() || '';

      // La lógica de añadir al carrito se maneja globalmente en main.js para evitar duplicados
      // if (window.AuraCart) {
      //   window.AuraCart.add({ title: titulo, price: priceNum, size: tallaActiva, image: img });
      // }

      this.innerHTML = '<i class="fas fa-check"></i> Agregado';
      this.style.backgroundColor = 'var(--verde-neon)';
      this.style.color = 'var(--negro)';

      setTimeout(() => {
        this.innerHTML = 'Añadir al carrito <i class="fas fa-shopping-bag"></i>';
        this.style.backgroundColor = '';
        this.style.color = '';
      }, 1200);

      mostrarNotificacion(`${titulo} agregado al carrito`);
      actualizarContadorCarrito();
      // if (window.openCartOverlay) window.openCartOverlay();
    });
  });

  function aplicarFiltros() {
    const q = (buscarInput?.value || '').toLowerCase().trim();
    const lista = catalogData.filter(p => {
      const matchesNombre = !q || (p.title || '').toLowerCase().includes(q);
      const matchesCategoria = categoriaSeleccionada === 'todos' || p.category === categoriaSeleccionada || p.type === categoriaSeleccionada;
      return matchesNombre && matchesCategoria;
    });
    renderLista(lista);
    markWishlistIcons();
    const stat = document.querySelector('.estadistica .numero');
    if (stat) stat.textContent = lista.length;
    mostrarNotificacion('Filtros aplicados');
  }

  function actualizarContadorCarrito() {
    const contador = document.querySelector('.contador-carrito');
    let cantidad = (window.AuraCart && window.AuraCart.count()) || parseInt(contador.textContent) || 0;
    contador.textContent = cantidad;
    contador.style.animation = 'pulse 0.5s ease';

    setTimeout(() => {
      contador.style.animation = '';
    }, 500);
  }

  function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-catalogo';
    notificacion.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${mensaje}</span>
    `;

    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--verde-neon);
        color: var(--negro);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--sombra);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
      notificacion.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notificacion.parentNode) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 3000);
  }

  const style = document.createElement('style');
  style.textContent = `
      @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
      }
  `;
  document.head.appendChild(style);

  const grids = Array.from(document.querySelectorAll('.grid-productos'));
  let gridCatalogo = grids[0] || document.getElementById('grid-catalogo');
  grids.forEach((g, i) => { if (i > 0) g.style.display = 'none'; });
  if (gridCatalogo) { gridCatalogo.innerHTML = ''; initCatalogoDinamico(gridCatalogo); }

  async function initCatalogoDinamico(grid) {
    try {
      grid.style.display = 'grid';
      grid.style.gap = '2rem';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      grid.style.width = '100%';
    } catch { }
    const genero = document.querySelector('.main-catalogo')?.dataset?.genero || (document.title.toLowerCase().includes('mujeres') ? 'mujeres' : 'hombres');
    let data = [];
    const allowDemo = (typeof window.allowDemoProducts === 'function' && window.allowDemoProducts());
    try {
      if (window.fetchProducts) data = await window.fetchProducts({ gender: genero });
      else throw new Error('no-datasource');
    } catch (e) {
      if (allowDemo) {
        data = (window.PRODUCTS_FALLBACK || []).filter(p => p.gender === genero);
      } else {
        const grid = document.getElementById('grid-catalogo');
        if (grid) grid.innerHTML = '<p class="texto-muted">No pudimos cargar los productos desde la base de datos.</p>';
        return;
      }
    }

    const gridEl = document.getElementById('grid-catalogo');
    if (!gridEl) return;

    renderLista = (list) => {
      if (!list.length) {
        gridEl.innerHTML = '<p class="texto-muted">No hay productos para mostrar.</p>';
        return;
      }
      const tpl = (p) => {
        const productId = p.id || p.slug || '';
        const productSlug = p.slug || p.id || '';
        const image = p.image || 'assets/images/placeholder.png';
        return `
      <div class="producto-card" data-product-id="${productId}" data-product-slug="${productSlug}" data-genero="${p.gender || ''}" data-type="${p.type || ''}" data-category="${p.category || p.type || ''}">
        <div class="producto-imagen-contenedor">
          <img src="${image}" class="producto-imagen" alt="${p.title}">
          <div class="producto-acciones">
            <button class="accion-btn" aria-label="Favorito"><i class="far fa-heart"></i></button>
            <button class="accion-btn" aria-label="Vista rápida"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div class="producto-info">
          <h3 class="producto-titulo">${p.title}</h3>
          <p class="producto-precio">$${(p.price || 0).toLocaleString()}</p>
          <div class="producto-tallas">
            <button class="talla-btn">S</button>
            <button class="talla-btn activa">M</button>
            <button class="talla-btn">L</button>
            <button class="talla-btn">XL</button>
            <button class="talla-btn">XXL</button>
          </div>
          <button class="btn-carrito" data-product-id="${productId}" data-product-slug="${productSlug}" data-title="${p.title}" data-price="${p.price}" data-image="${image}">Añadir al carrito <i class="fas fa-shopping-bag"></i></button>
        </div>
      </div>`;
      };
      gridEl.innerHTML = list.map(p => `${tpl(p)}`).join('');
    };

    catalogData = data;
    renderLista(catalogData);
    await markWishlistIcons();
    crearFiltroCategorias(catalogData);
  }

  function crearFiltroCategorias(lista) {
    const main = document.querySelector('.main-catalogo');
    if (!main) return;
    let barra = document.getElementById('catalogo-filtros');
    if (!barra) {
      barra = document.createElement('div');
      barra.id = 'catalogo-filtros';
      barra.className = 'barra-filtros';
      barra.innerHTML = `
        <div class="filtro-wrapper">
          <i class="fas fa-filter filtro-icono"></i>
          <select id="filterCategory" class="filtro-select" aria-label="Filtrar por categoría">
            <option value="todos">Todas las categorías</option>
          </select>
          <i class="fas fa-chevron-down filtro-chevron"></i>
        </div>
      `;
      const grid = document.getElementById('grid-catalogo');
      if (grid) main.insertBefore(barra, grid);
    }
    const select = barra.querySelector('#filterCategory');
    const categorias = Array.from(new Set(lista.map(p => p.category || p.type).filter(Boolean)));
    select.innerHTML = `<option value="todos">Todas las categorías</option>` + categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    select.value = categoriaSeleccionada;
    select.onchange = (e) => { categoriaSeleccionada = e.target.value; aplicarFiltros(); };
  }


  function abrirModalVistaRapida({ titulo, precioTxt, img }) {
    let overlay = document.getElementById('modal-quickview');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-quickview';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
          <div class="modal-content" role="dialog" aria-modal="true">
            <button class="modal-close" aria-label="Cerrar">&times;</button>
            <div class="modal-grid">
              <img class="modal-img" alt="Producto" />
              <div class="modal-body">
                <h3 class="modal-title"></h3>
                <div class="modal-price"></div>
                <p class="modal-desc">Tela suave al tacto con mezcla de algodon peinado y fibras duraderas. Transpirable, ligera y con caida natural. Ideal para uso diario.</p>
                <ul class="modal-specs">
                  <li>Composicion: 95% algodon, 5% elastano</li>
                  <li>Cuidados: Lavar a 30C, no usar blanqueador</li>
                  <li>Fit: Regular</li>
                </ul>
                <button class="btn btn-primario btn-add-modal">Añadir al carrito</button>
              </div>
            </div>
          </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay?.remove(); });
    }
    overlay.querySelector('.modal-img').src = img || '';
    overlay.querySelector('.modal-title').textContent = titulo;
    overlay.querySelector('.modal-price').textContent = precioTxt;
    overlay.querySelector('.btn-add-modal').onclick = () => {
      const priceNum = parseInt(precioTxt.replace(/[^0-9]/g, ''));
      if (window.AuraCart) window.AuraCart.add({ title: titulo, price: priceNum, image: img });
      if (window.openCartOverlay) window.openCartOverlay();
      overlay.remove();
    };
    overlay.style.display = 'flex';
  }

  async function loadWishlistState() {
    if (wishlistLoaded) return wishlistSet;
    try {
      const res = await fetch('api/wishlist.php', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        wishlistSet = new Set((data.items || []).map(i => i.slug));
      }
    } catch (e) { }
    wishlistLoaded = true;
    return wishlistSet;
  }

  async function markWishlistIcons() {
    await loadWishlistState();
    document.querySelectorAll('.producto-card').forEach(card => {
      const slug = card.dataset.productSlug || card.dataset.productId;
      if (!slug) return;
      const heart = card.querySelector('.accion-btn .fa-heart');
      if (!heart) return;
      const active = wishlistSet.has(slug);
      heart.classList.toggle('fas', active);
      heart.classList.toggle('far', !active);
      heart.style.color = active ? 'var(--rojo-neon)' : '';
    });
  }

  async function toggleWishlist(slug) {
    await loadWishlistState();
    const isSaved = wishlistSet.has(slug);
    const method = isSaved ? 'DELETE' : 'POST';
    const res = await fetch('api/wishlist.php', {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_slug: slug })
    });
    const data = await res.json();
    if (res.status === 401) {
      window.location.href = 'login.html?redirect=catalogo';
      return false;
    }
    if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la lista');
    wishlistSet = new Set((data.items || []).map(i => i.slug));
    return true;
  }
});
