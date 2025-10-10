document.addEventListener('DOMContentLoaded', function() {
    // Filtros funcionales
    const filtroSelects = document.querySelectorAll('.filtro-select');
    
    filtroSelects.forEach(select => {
        select.addEventListener('change', function() {
            aplicarFiltros();
        });
    });
    
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
    
    // Botones de acción (corazón y lupa)
    const accionBtns = document.querySelectorAll('.accion-btn');
    accionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('fa-heart')) {
                // Toggle like
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = 'var(--rojo-neon)';
                    mostrarNotificacion('Agregado a favoritos');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '';
                    mostrarNotificacion('Removido de favoritos');
                }
            } else if (icon.classList.contains('fa-search')) {
                // Ver producto (simulación)
                const producto = this.closest('.producto-card');
                const titulo = producto.querySelector('.producto-titulo').textContent;
                mostrarNotificacion(`Vista rápida: ${titulo}`);
            }
        });
    });
    
    // Botones añadir al carrito
    const carritoBtns = document.querySelectorAll('.btn-carrito');
    carritoBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const producto = this.closest('.producto-card');
            const titulo = producto.querySelector('.producto-titulo').textContent;
            const precio = producto.querySelector('.producto-precio').textContent;
            
            // Animación del botón
            this.innerHTML = '<i class="fas fa-check"></i> Agregado';
            this.style.backgroundColor = 'var(--verde-neon)';
            this.style.color = 'var(--negro)';
            
            setTimeout(() => {
                this.innerHTML = 'Añadir al carrito <i class="fas fa-shopping-bag"></i>';
                this.style.backgroundColor = '';
                this.style.color = '';
            }, 2000);
            
            mostrarNotificacion(`${titulo} agregado al carrito`);
            actualizarContadorCarrito();
        });
    });
    
    // Función para aplicar filtros (simulación)
    function aplicarFiltros() {
        const productos = document.querySelectorAll('.producto-card');
        let productosVisibles = 0;
        
        productos.forEach(producto => {
            producto.style.display = 'block';
            productosVisibles++;
        });
        
        // Actualizar estadísticas
        document.querySelector('.estadistica .numero').textContent = productosVisibles;
        
        mostrarNotificacion('Filtros aplicados');
    }
    
    // Función para actualizar contador del carrito
    function actualizarContadorCarrito() {
        const contador = document.querySelector('.contador-carrito');
        let cantidad = parseInt(contador.textContent) || 0;
        contador.textContent = cantidad + 1;
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
});