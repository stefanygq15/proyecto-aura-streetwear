(() => {
  if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const nameEl = document.getElementById('perfilNombre');
    const emailEl = document.getElementById('perfilEmail');
    const miembroEl = document.getElementById('perfilMiembro');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const correoInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const cerrarSesionBtn = document.querySelector('.cerrar-sesion');
    const pedidosLista = document.getElementById('listaPedidos');
    const sections = document.querySelectorAll('.seccion-perfil');
    const menuLinks = document.querySelectorAll('.perfil-menu a[href^="#"]:not(.cerrar-sesion)');

    let user = null;

    function activateSection(id) {
      const target = document.getElementById(id) || document.getElementById('informacion');
      sections.forEach(sec => sec.classList.toggle('activo', sec === target));
      menuLinks.forEach(link => link.classList.toggle('activo', link.getAttribute('href') === `#${id}`));
    }

    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '') || 'informacion';
        activateSection(targetId);
        history.replaceState(null, '', `#${targetId}`);
      });
    });
    activateSection(window.location.hash ? window.location.hash.replace('#', '') : 'informacion');

    async function loadSession() {
      try {
        const res = await fetch('api/auth/session.php', { credentials: 'include' });
        const data = await res.json();
        if (!data.authenticated || !data.user) {
          window.location.href = 'login.html?redirect=perfil';
          return;
        }
        user = data.user;
        renderUser();
        loadOrders();
      } catch (err) {
        console.error(err);
        window.location.href = 'login.html?redirect=perfil';
      }
    }

    function renderUser() {
      if (!user) return;
      const fullName = user.name || 'Usuario Aura';
      if (nameEl) nameEl.textContent = fullName;
      if (emailEl) emailEl.textContent = user.email || 'email@ejemplo.com';
      if (miembroEl) {
        const date = user.since ? new Date(user.since) : null;
        const formatted = date ? date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : '-';
        miembroEl.innerHTML = `<i class="fas fa-calendar"></i> Miembro desde ${formatted}`;
      }

      const parts = fullName.trim().split(/\s+/);
      const nombre = parts.shift() || '';
      const apellido = parts.join(' ');

      if (nombreInput) nombreInput.value = nombre;
      if (apellidoInput) apellidoInput.value = apellido;
      if (correoInput) correoInput.value = user.email || '';
      if (telefonoInput && user.phone) telefonoInput.value = user.phone;
    }

    async function loadOrders() {
      if (!pedidosLista) return;
      pedidosLista.innerHTML = '<p class="texto-muted">Cargando pedidos...</p>';
      try {
        const res = await fetch('api/orders/list.php', { credentials: 'include' });
        if (res.status === 401) {
          window.location.href = 'login.html?redirect=perfil';
          return;
        }
        const data = await res.json();
        const orders = data.orders || [];
        if (!orders.length) {
          pedidosLista.innerHTML = '<p class="texto-muted">Aún no tienes compras registradas.</p>';
          return;
        }
        pedidosLista.innerHTML = orders.map(renderPedido).join('');
      } catch (err) {
        pedidosLista.innerHTML = '<p class="texto-muted">No pudimos cargar tus pedidos.</p>';
      }
    }

    function renderPedido(order) {
      const date = order.created_at ? new Date(order.created_at) : null;
      const fecha = date ? date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const items = (order.items || []).map(item => `
        <div class="pedido-item">
          ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
          <div class="pedido-item-info">
            <strong>${item.title}</strong>
            <div>${item.qty} unidad(es) ${item.size ? `· Talla ${item.size}` : ''}</div>
          </div>
          <span>${item.price_formatted}</span>
        </div>
      `).join('');
      return `
        <article class="pedido-card">
          <div class="pedido-header">
            <div>
              <h3>Pedido ${order.id}</h3>
              <p class="texto-muted">${fecha}</p>
            </div>
            <div class="pedido-status">
              <i class="fas fa-circle"></i> ${order.status}
            </div>
          </div>
          <div class="pedido-items">
            ${items}
          </div>
          <div class="pedido-total">
            <span>Total</span>
            <span>${order.total_formatted}</span>
          </div>
        </article>
      `;
    }

    if (cerrarSesionBtn) {
      cerrarSesionBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await fetch('api/auth/logout.php', { method: 'POST', credentials: 'include' });
        } finally {
          if (window.refreshAuraSession) window.refreshAuraSession();
          window.location.href = 'login.html';
        }
      });
    }

    const form = document.querySelector('.form-perfil');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Edición de perfil próximamente. Por ahora los datos se cargan desde la sesión.');
      });
    }

    loadSession();
  });
})();
