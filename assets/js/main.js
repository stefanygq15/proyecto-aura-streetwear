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
      const key = `${newItem.id || newItem.title}|${newItem.size || ''}`.toLowerCase();
      const found = items.find(it => (`${it.id||it.title}|${it.size||''}`).toLowerCase() === key);
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

  // Evitar que clicks internos al drawer lo cierren por el handler global
  if (cart) {
    cart.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Enlaces de cuenta según sesión
  function updateAccountLinks() {
    const user = localStorage.getItem('aura_user');
    const accountLinks = [];
    document.querySelectorAll('.iconos-header a').forEach(a => {
      if (a.querySelector('.fa-user')) accountLinks.push(a);
    });
    const overlayAccount = document.querySelector('#overlayMenu .overlay-link[href="login.html"]') ||
      Array.from(document.querySelectorAll('#overlayMenu .overlay-link')).find(a => a.textContent.includes('Cuenta'));
    const href = user ? 'perfil.html' : 'login.html';
    accountLinks.forEach(a => a.setAttribute('href', href));
    if (overlayAccount) overlayAccount.setAttribute('href', href);
  }
  updateAccountLinks();

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
    let title = btn.getAttribute('data-title');
    let price = btn.getAttribute('data-price');
    let image = btn.getAttribute('data-image');
    if (!title && card) title = card.querySelector('.producto-titulo')?.textContent?.trim();
    if (!price && card) price = card.querySelector('.producto-precio')?.textContent?.trim();
    if (!image && card) image = card.querySelector('img')?.getAttribute('src');
    const size = card?.querySelector('.talla-btn.activa')?.textContent?.trim() || '';
    if (!title || !price) return;
    Cart.add({ title, price: parsePrice(price), size, image });
    updateBadge();
    // Abre el carrito para feedback inmediato
    openCart();
  });

  // Exponer apertura del carrito
  window.openCartOverlay = openCart;
})();
