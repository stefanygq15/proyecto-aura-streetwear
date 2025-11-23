// Menú superpuesto (overlay) general para todo el sitio
(() => {
  // --- Cart storage utility ---
  const STORAGE_KEY = 'aura_cart';
  const parsePrice = (value) => {
    if (typeof value === 'number') return value;
    return parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
  };
  const Cart = {
    get() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
    },
    save(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); },
    count() { return this.get().reduce((a, it) => a + (it.qty || 1), 0); },
    total() { return this.get().reduce((a, it) => a + parsePrice(it.price) * (it.qty || 1), 0); },
    add(newItem) {
      const items = this.get();
      const identifier = newItem.id || newItem.slug || newItem.title;
      const key = `${identifier}|${newItem.size || ''}`.toLowerCase();
      const found = items.find(it => (`${it.id || it.slug || it.title}|${it.size || ''}`).toLowerCase() === key);
      if (found) { found.qty = (found.qty || 1) + (newItem.qty || 1); }
      else { items.push({ ...newItem, qty: newItem.qty || 1 }); }
      this.save(items);
    },
    updateQty(keyIndex, delta) {
      const items = this.get();
      const it = items[keyIndex];
      if (!it) return;
      const newQty = (it.qty || 1) + delta;
      if (newQty <= 0) { items.splice(keyIndex, 1); }
      else { it.qty = newQty; }
      this.save(items);
    },
    remove(keyIndex) {
      const items = this.get();
      items.splice(keyIndex, 1);
      this.save(items);
    },
    clear() { this.save([]); }
  };
  window.AuraCart = Cart;
  const openBtn = document.getElementById('openMenu');
  const closeBtn = document.getElementById('closeMenu');
  const menu = document.getElementById('overlayMenu');
  const cartOpenBtn = document.getElementById('openCart');
  const cartCloseBtn = document.getElementById('closeCart');
  const cart = document.getElementById('overlayCart');

  if (!openBtn || !menu) return; // página sin header nuevo

  const openMenu = () => {
    if (cart) cart.classList.remove('open');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
  };

  const closeMenu = () => {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  };

  const openCart = () => {
    if (!cart) return;
    closeMenu();
    renderCartDrawer();
    cart.classList.add('open');
    cart.setAttribute('aria-hidden', 'false');
  };

  const closeCart = () => {
    if (!cart) return;
    cart.classList.remove('open');
    cart.setAttribute('aria-hidden', 'true');
  };

  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  if (cartOpenBtn) {
    cartOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (cart && cart.classList.contains('open')) {
        closeCart();
      } else {
        openCart();
      }
    });
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCart();
    });
  }

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== openBtn) closeMenu();
    if (cart && cart.classList.contains('open') && !cart.contains(e.target) && e.target !== cartOpenBtn) closeCart();
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); closeCart(); }
  });

  // Render contador al cargar
  const updateBadge = () => {
    const badge = document.querySelector('.contador-carrito');
    if (badge) badge.textContent = Cart.count();
  };
  updateBadge();
  // Exponer para que otras páginas (carrito/checkout) lo usen
  window.updateCartBadge = updateBadge;

  // Evitar que clicks internos al drawer lo cierren por el handler global
  if (cart) {
    cart.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  async function updateAccountLinks() {
    const accountLinks = [];
    document.querySelectorAll('.iconos-header a').forEach(a => {
      if (a.querySelector('.fa-user')) accountLinks.push(a);
    });
    const overlayAccount = document.querySelector('#overlayMenu .overlay-link[href="login.html"]') ||
      Array.from(document.querySelectorAll('#overlayMenu .overlay-link')).find(a => a.textContent.includes('Cuenta'));

    let user = null;
    try {
      const res = await fetch('api/auth/session.php', { credentials: 'include' });
      const data = await res.json();
      if (data && data.authenticated) user = data.user;
    } catch (err) {
      user = null;
    }

    const href = user ? 'perfil.html' : 'login.html';
    accountLinks.forEach(a => {
      a.setAttribute('href', href);
      a.classList.toggle('is-logged', Boolean(user));
      if (user) {
        a.setAttribute('title', `Hola, ${user.name}`);
      } else {
        a.removeAttribute('title');
      }
    });
    if (overlayAccount) overlayAccount.setAttribute('href', href);
  }
  updateAccountLinks();
  window.refreshAuraSession = updateAccountLinks;

  // Overlay search submit -> ir a coleccion con query
  const overlaySearch = document.getElementById('overlaySearch');
  const overlaySearchInput = document.getElementById('overlaySearchInput');
  if (overlaySearch) {
    overlaySearch.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = overlaySearchInput?.value?.trim();
      const url = q ? `search.html?search=${encodeURIComponent(q)}` : 'search.html';
      window.location.href = url;
    });
  }

  // Sugerencias en tiempo real en el menú hamburguesa
  (function () {
    if (!overlaySearchInput) return;
    // contenedor de sugerencias
    let suggest = document.getElementById('overlaySuggest');
    if (!suggest) {
      suggest = document.createElement('div');
      suggest.id = 'overlaySuggest';
      suggest.className = 'overlay-suggest';
      // insertar después del bloque de búsqueda
      const parent = document.querySelector('.overlay-search');
      if (parent) parent.appendChild(suggest);
    }
    let lastQ = '';
    async function doSuggest(q) {
      if (!q || q.length < 2) { suggest.classList.remove('open'); suggest.innerHTML = ''; return; }
      try {
        let items = [];
        if (window.fetchProducts) items = await window.fetchProducts({ search: q });
        if (!items || !items.length) { suggest.classList.remove('open'); suggest.innerHTML = ''; return; }
        suggest.innerHTML = items.slice(0, 8).map(p =>
          `<div class="overlay-suggest-item" data-q="${p.title}">
            <img src="${p.image || ''}" alt="${p.title}">
            <div style="flex:1">${p.title}</div>
            <div>$${(p.price || 0).toLocaleString()}</div>
          </div>`).join('');
        suggest.classList.add('open');
      } catch (e) { suggest.classList.remove('open'); }
    }
    overlaySearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (q === lastQ) return; lastQ = q; doSuggest(q);
    });
    suggest.addEventListener('click', (e) => {
      const item = e.target.closest('.overlay-suggest-item');
      if (!item) return;
      const q = item.getAttribute('data-q');
      window.location.href = `coleccion.html?search=${encodeURIComponent(q)}`;
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') suggest.classList.remove('open'); });
  })();

  // Render contenido del drawer
  function renderCartDrawer() {
    if (!cart) return;
    const body = cart.querySelector('.cart-body');
    const totalEl = cart.querySelector('.cart-total span:last-child');
    if (!body) return;
    const items = Cart.get();
    body.innerHTML = '';
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '1rem';
      empty.style.opacity = '0.9';
      empty.textContent = 'Tu carrito está vacío';
      body.appendChild(empty);
    } else {
      items.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'cart-item-mini';
        row.innerHTML = `
          <img src="${it.image || ''}" alt="${it.title}">
          <div class="cart-item-info">
            <div class="cart-item-title">${it.title}</div>
            <div class="cart-item-meta">${it.size ? 'Talla ' + it.size + ' • ' : ''}$${parsePrice(it.price).toLocaleString()}</div>
          </div>
          <div class="cart-item-actions" data-idx="${idx}">
            <button class="qty-btn" aria-label="Restar">-</button>
            <span>${it.qty || 1}</span>
            <button class="qty-btn" aria-label="Sumar">+</button>
            <button class="remove-btn" aria-label="Eliminar"><i class="fas fa-trash"></i></button>
          </div>`;
        body.appendChild(row);
      });
    }
    if (totalEl) totalEl.textContent = `$${Cart.total().toLocaleString()}`;

    // Bind qty buttons
    body.querySelectorAll('.cart-item-actions').forEach(el => {
      const idx = parseInt(el.getAttribute('data-idx'));
      const minus = el.querySelector('.qty-btn:nth-child(1)');
      const plus = el.querySelector('.qty-btn:nth-child(3)');
      const remove = el.querySelector('.remove-btn');
      if (minus) minus.addEventListener('click', () => {
        // Evitar burbujeo hacia el document-click (no cerrar drawer)
        event?.stopPropagation?.();
        const current = Cart.get()[idx];
        if (current && (current.qty || 1) <= 1) { Cart.remove(idx); }
        else { Cart.updateQty(idx, -1); }
        renderCartDrawer(); updateBadge();
      });
      if (plus) plus.addEventListener('click', () => { Cart.updateQty(idx, 1); renderCartDrawer(); updateBadge(); });
      if (remove) remove.addEventListener('click', (ev) => { ev.stopPropagation(); Cart.remove(idx); renderCartDrawer(); updateBadge(); });
    });

    // Ensure Clear button exists
    const footer = cart.querySelector('.cart-footer');
    if (footer && !footer.querySelector('#clearCart')) {
      const clearBtn = document.createElement('button');
      clearBtn.id = 'clearCart';
      clearBtn.className = 'btn-cart btn-clear';
      clearBtn.textContent = 'Vaciar carrito';
      footer.insertBefore(clearBtn, footer.firstChild);
    }
    const clear = cart.querySelector('#clearCart');
    if (clear) clear.onclick = () => { Cart.clear(); renderCartDrawer(); updateBadge(); };
  }

  // Delegación: añadir al carrito desde cualquier página
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-carrito');
    if (!btn) return;
    const card = btn.closest('.producto-card');
    const productId = btn.dataset.productId || card?.dataset.productId || '';
    const productSlug = btn.dataset.productSlug || card?.dataset.productSlug || '';
    let title = btn.getAttribute('data-title');
    let price = btn.getAttribute('data-price');
    let image = btn.getAttribute('data-image');
    if (!title && card) title = card.querySelector('.producto-titulo')?.textContent?.trim();
    if (!price && card) price = card.querySelector('.producto-precio')?.textContent?.trim();
    if (!image && card) image = card.querySelector('img')?.getAttribute('src');
    const size = card?.querySelector('.talla-btn.activa')?.textContent?.trim() || '';
    if (!title || !price) return;
    Cart.add({ id: productId, slug: productSlug, title, price: parsePrice(price), size, image });
    updateBadge();
    // Abre el carrito para feedback inmediato
    openCart();
  });

  // Exponer apertura del carrito
  window.openCartOverlay = openCart;
})();

// Aviso sencillo de cookies (persistencia en cookie, no en localStorage)
(() => {
  const COOKIE_NAME = 'aura_cookie_consent';

  const getCookie = (name) => {
    const eq = `${name}=`;
    const found = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(eq));
    return found ? decodeURIComponent(found.slice(eq.length)) : null;
  };

  const setCookie = (name, value, days = 180) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
  };

  const currentConsent = getCookie(COOKIE_NAME);
  if (currentConsent === 'accepted' || currentConsent === 'rejected') return;

  const style = document.createElement('style');
  style.textContent = `
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2000;
      background: rgba(23, 24, 27, 0.96);
      color: #f5f5f5;
      padding: 1rem 1.25rem;
      box-shadow: 0 -6px 24px rgba(0,0,0,0.25);
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      font-size: 0.95rem;
    }
    .cookie-banner strong { color: #e9786f; }
    .cookie-banner button {
      background: #e9786f;
      color: #fff;
      border: none;
      padding: 0.55rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .cookie-banner button.secondary {
      background: transparent;
      color: #f5f5f5;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .cookie-banner a {
      color: #f5f5f5;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <div style="flex:1;min-width:240px;">¿Nos das permiso para usar cookies de preferencia y medición? Puedes leer más en la <a href="nosotros.html" aria-label="Ver política de privacidad">política de privacidad</a>.</div>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
      <button type="button" id="rejectCookies" class="secondary">Rechazar</button>
      <button type="button" id="acceptCookies">Aceptar</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector('#acceptCookies').addEventListener('click', () => {
    setCookie(COOKIE_NAME, 'accepted');
    banner.remove();
  });
  banner.querySelector('#rejectCookies').addEventListener('click', () => {
    setCookie(COOKIE_NAME, 'rejected');
    banner.remove();
  });
})();
