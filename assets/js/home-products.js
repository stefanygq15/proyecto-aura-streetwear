document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid-destacados');
  const filterBtns = document.querySelectorAll('.filtro-btn[data-filter]');
  if (!grid) return;

  let wishlistSet = new Set();
  let wishlistLoaded = false;
  let products = [];

  init();

  function bindFilters() {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        const filter = btn.dataset.filter;
        renderCards(filter);
      });
    });
  }

  async function init() {
    bindFilters();
    await loadWishlistState();
    await loadProducts();
    renderCards('todos');
  }

  async function loadProducts() {
    const allowDemo = (typeof window.allowDemoProducts === 'function' && window.allowDemoProducts());
    try {
      const hombres = await fetchProducts({ gender: 'hombres', limit: 4 });
      const mujeres = await fetchProducts({ gender: 'mujeres', limit: 4 });
      products = [...hombres, ...mujeres];
    } catch (e) {
      if (allowDemo) {
        products = window.PRODUCTS_FALLBACK || [];
      } else {
        products = [];
        grid.innerHTML = '<p class="texto-muted">No pudimos cargar los productos. Verifica la API de productos.</p>';
      }
    }
  }

  function renderCards(filter) {
    const list = products.filter(p => {
      if (filter === 'hombres') return p.gender === 'hombres';
      if (filter === 'mujeres') return p.gender === 'mujeres';
      return true;
    });
    grid.innerHTML = list.map(renderCard).join('');
    markWishlistIcons();
    bindCardEvents();
  }

  function renderCard(p) {
    const slug = p.slug || p.id || '';
    const image = p.image || p.main_image || 'assets/images/placeholder.png';
    const price = p.price || p.price_cents || 0;
    const priceFormatted = `$${(price).toLocaleString()}`;
    return `
      <div class="producto-card" data-product-id="${p.id || ''}" data-product-slug="${slug}" data-genero="${p.gender || ''}">
        <div class="producto-imagen-contenedor">
          <img src="${image}" alt="${p.title}" class="producto-imagen">
          <div class="producto-acciones">
            <button class="accion-btn" aria-label="Agregar a favoritos"><i class="far fa-heart"></i></button>
            <button class="accion-btn" aria-label="Ver detalles del producto"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div class="producto-info">
          <h3 class="producto-titulo">${p.title}</h3>
          <p class="producto-precio">${priceFormatted}</p>
          <div class="producto-tallas">
            <button class="talla-btn activa">M</button>
            <button class="talla-btn">L</button>
            <button class="talla-btn">XL</button>
          </div>
          <button class="btn-carrito" data-price="${price}" data-title="${p.title}" data-image="${image}">Añadir al carrito <i class="fas fa-shopping-bag"></i></button>
        </div>
      </div>
    `;
  }

  function bindCardEvents() {
    grid.querySelectorAll('.talla-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.producto-card');
        if (!card) return;
        card.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('activa'));
        btn.classList.add('activa');
      });
    });

    grid.querySelectorAll('.btn-carrito').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.producto-card');
        const title = btn.dataset.title || card.querySelector('.producto-titulo')?.textContent?.trim();
        const price = parseInt(btn.dataset.price || '0', 10);
        const image = btn.dataset.image || card.querySelector('.producto-imagen')?.getAttribute('src');
        const talla = card.querySelector('.talla-btn.activa')?.textContent?.trim() || '';
        // La lógica de añadir al carrito se maneja globalmente en main.js
        // if (window.AuraCart) {
        //   window.AuraCart.add({ title, price, size: talla, image });
        // }
        btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
        setTimeout(() => { btn.innerHTML = 'Añadir al carrito <i class="fas fa-shopping-bag"></i>'; }, 1200);
      });
    });

    grid.querySelectorAll('.accion-btn .fa-search').forEach(icon => {
      icon.parentElement.addEventListener('click', () => openQuickView(icon));
    });

    grid.querySelectorAll('.accion-btn .fa-heart').forEach(icon => {
      icon.parentElement.addEventListener('click', () => toggleHeart(icon));
    });
  }

  function openQuickView(icon) {
    const card = icon.closest('.producto-card');
    const title = card.querySelector('.producto-titulo')?.textContent || '';
    const priceTxt = card.querySelector('.producto-precio')?.textContent || '';
    const img = card.querySelector('.producto-imagen')?.getAttribute('src') || '';
    let overlay = document.getElementById('modal-quickview-home');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-quickview-home';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true">
          <button class="modal-close" aria-label="Cerrar">&times;</button>
          <div class="modal-grid">
            <img class="modal-img" alt="Producto" />
            <div class="modal-body">
              <h3 class="modal-title"></h3>
              <div class="modal-price"></div>
              <p class="modal-desc">Prenda seleccionada de nuestra colección.</p>
              <button class="btn btn-primario btn-add-modal">Añadir al carrito</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
    }
    overlay.querySelector('.modal-img').src = img;
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-price').textContent = priceTxt;
    overlay.querySelector('.btn-add-modal').onclick = () => {
      const priceNum = parseInt(priceTxt.replace(/[^0-9]/g, ''), 10) || 0;
      if (window.AuraCart) window.AuraCart.add({ title, price: priceNum, image: img });
      overlay.remove();
    };
    overlay.style.display = 'flex';
  }

  async function toggleHeart(icon) {
    const card = icon.closest('.producto-card');
    const slug = card?.dataset?.productSlug || card?.dataset?.productId || '';
    if (!slug) return;
    try {
      const ok = await toggleWishlist(slug);
      if (!ok) return;
      const active = wishlistSet.has(slug);
      icon.classList.toggle('fas', active);
      icon.classList.toggle('far', !active);
      icon.style.color = active ? 'var(--rojo-neon)' : '';
    } catch (err) {
      console.error(err);
    }
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

  function markWishlistIcons() {
    grid.querySelectorAll('.producto-card').forEach(card => {
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
      window.location.href = 'login.html?redirect=index';
      return false;
    }
    if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la lista');
    wishlistSet = new Set((data.items || []).map(i => i.slug));
    return true;
  }
});
