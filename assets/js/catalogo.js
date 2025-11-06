document.addEventListener('DOMContentLoaded', function() {
    // Filtros funcionales + búsqueda
    if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }
    const filtroSelects = document.querySelectorAll('.filtro-select');
    const buscarInput = document.getElementById('buscar-catalogo');
    
    filtroSelects.forEach(select => {
        select.addEventListener('change', function() {
            aplicarFiltros();
        });
    });

    if (buscarInput) {
        // Prefill desde ?search=
        const params = new URLSearchParams(window.location.search);
        const q = params.get('search');
        if (q) { buscarInput.value = q; }
        buscarInput.addEventListener('input', aplicarFiltros);
    }
    
    // Selector de tallas
    const tallaBtns = document.querySelectorAll('.talla-btn');
    tallaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.producto-card');
            const otrasTallas = card.querySelectorAll('.talla-btn');
            otrasTallas.forEach(b => b.classList.remove('activa'));
            this.classList.add('activa');
        });
    });
    
    // Botones de acción (delegado: corazón y vista rápida)
    document.addEventListener('click', function(e){
        const accion = e.target.closest('.accion-btn');
        if (!accion) return;
        const icon = accion.querySelector('i');
        if (!icon) return;
        if (icon.classList.contains('fa-heart')) {
            if (icon.classList.contains('far')) {
                icon.classList.remove('far'); icon.classList.add('fas'); icon.style.color = 'var(--rojo-neon)';
                mostrarNotificacion('Agregado a favoritos');
            } else {
                icon.classList.remove('fas'); icon.classList.add('far'); icon.style.color = '';
                mostrarNotificacion('Removido de favoritos');
            }
        } else if (icon.classList.contains('fa-search')) {
            const card = accion.closest('.producto-card');
            const titulo = card.querySelector('.producto-titulo')?.textContent?.trim();
            const precioTxt = card.querySelector('.producto-precio')?.textContent?.trim();
            const img = card.querySelector('.producto-imagen')?.getAttribute('src');
            abrirModalVistaRapida({ titulo, precioTxt, img });
        }
    });
    
    // Botones añadir al carrito
    const carritoBtns = document.querySelectorAll('.btn-carrito');
    carritoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const producto = this.closest('.producto-card');
            const titulo = producto.querySelector('.producto-titulo').textContent.trim();
            const precioTxt = producto.querySelector('.producto-precio').textContent.trim();
            const img = producto.querySelector('.producto-imagen')?.getAttribute('src');
            const tallaActiva = producto.querySelector('.talla-btn.activa')?.textContent?.trim() || '';

            // Guardar en carrito (localStorage) mediante util global
            const priceNum = parseInt(precioTxt.replace(/[^0-9]/g, ''));
            if (window.AuraCart) {
                window.AuraCart.add({ title: titulo, price: priceNum, size: tallaActiva, image: img });
            }

            // Animación del botón
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
            // Abrir el drawer para feedback inmediato si está disponible
            if (window.openCartOverlay) window.openCartOverlay();
        });
    });
    
    // Función para aplicar filtros (simulación)
    function aplicarFiltros() {
        const productos = document.querySelectorAll('.producto-card');
        let productosVisibles = 0;
        const q = (buscarInput?.value || '').toLowerCase().trim();
        
        productos.forEach(producto => {
            const nombre = producto.querySelector('.producto-titulo')?.textContent.toLowerCase() || '';
            const matches = !q || nombre.includes(q);
            producto.style.display = matches ? 'block' : 'none';
            productosVisibles++;
        });
        
        // Actualizar estadísticas
        document.querySelector('.estadistica .numero').textContent = productosVisibles;
        
        mostrarNotificacion('Filtros aplicados');
    }
    
    // Función para actualizar contador del carrito
    function actualizarContadorCarrito() {
        const contador = document.querySelector('.contador-carrito');
        let cantidad = (window.AuraCart && window.AuraCart.count()) || parseInt(contador.textContent) || 0;
        contador.textContent = cantidad;
        contador.style.animation = 'pulse 0.5s ease';
        
        setTimeout(() => {
            contador.style.animation = '';
        }, 500);
    }
    
    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-catalogo';
        notificacion.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        `;
        
        // Estilos para la notificación
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
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    document.body.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }
    
    // Animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Catálogo dinámico (Hombres/Mujeres) usando datos locales o desde API
    // Siempre usar la primera grilla visible del documento
    const grids = Array.from(document.querySelectorAll('.grid-productos'));
    let gridCatalogo = grids[0] || document.getElementById('grid-catalogo');
    // Oculta grillas duplicadas si existen
    grids.forEach((g,i)=>{ if(i>0) g.style.display = 'none'; });
    if (gridCatalogo) { gridCatalogo.innerHTML = ''; initCatalogoDinamico(gridCatalogo); }

    async function initCatalogoDinamico(grid){
        // Asegurar layout de rejilla (algunos estilos pueden no cargarse)
        try {
            grid.style.display = 'grid';
            grid.style.gap = '2rem';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            grid.style.width = '100%';
        } catch {}
        const genero = document.querySelector('.main-catalogo')?.dataset?.genero || (document.title.toLowerCase().includes('mujeres')?'mujeres':'hombres');
        let data = [];
        try {
            if (window.fetchProducts) data = await window.fetchProducts({ gender: genero });
            else throw new Error('no-datasource');
        } catch (e) {
            data = (window.PRODUCTS_FALLBACK || []).filter(p => p.gender === genero);
        }

        // Se pidió quitar filtros: no buscamos selects ni inputs; solo mostramos por género
        const typeSelect = null;
        const orderSelect = null;
        const searchInput = null;

        function render(list){
            grid.innerHTML = list.map(p => `
            <div class="producto-card" data-genero="${p.gender}" data-type="${p.type}">
              <div class="producto-imagen-contenedor">
                <img src="${p.image}" class="producto-imagen" alt="${p.title}">
                <div class="producto-acciones">
                  <button class="accion-btn" aria-label="Favorito"><i class="far fa-heart"></i></button>
                  <button class="accion-btn" aria-label="Vista rápida"><i class="fas fa-search"></i></button>
                </div>
              </div>
              <div class="producto-info">
                <h3 class="producto-titulo">${p.title}</h3>
                <p class="producto-precio">$${(p.price||0).toLocaleString()}</p>
                <div class="producto-tallas">
                  <button class="talla-btn activa">M</button>
                  <button class="talla-btn">L</button>
                </div>
                <button class="btn-carrito" data-title="${p.title}" data-price="${p.price}" data-image="${p.image}">Añadir al carrito <i class="fas fa-shopping-bag"></i></button>
              </div>
            </div>`).join('');
        }

        function apply(){
            let list = data.slice();
            // sin filtros ni búsqueda; solo render con el orden original
            render(list);
        }

        apply();
    }

    // Modal de vista rápida
    function abrirModalVistaRapida({ titulo, precioTxt, img }) {
        // Crear overlay si no existe
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
                      <p class="modal-desc">Tela suave al tacto con mezcla de algodón peinado y fibras duraderas. Transpirable, ligera y con caída natural. Ideal para uso diario.</p>
                      <ul class="modal-specs">
                        <li>Composición: 95% algodón, 5% elastano</li>
                        <li>Cuidados: Lavar a 30°C, no usar blanqueador</li>
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
});
