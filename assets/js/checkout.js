// checkout.js - Funcionalidad para el proceso de checkout

// Navegación entre pasos
function siguientePaso(paso) {
    // Validar el paso actual antes de avanzar
    if (validarPaso(paso - 1)) {
        // Ocultar paso actual
        document.querySelectorAll('.paso-contenido').forEach(contenido => {
            contenido.classList.remove('activo');
        });
        
        // Mostrar siguiente paso
        document.getElementById(`paso-${paso}`).classList.add('activo');
        
        // Actualizar indicadores de pasos
        document.querySelectorAll('.paso').forEach(p => {
            p.classList.remove('activo');
        });
        document.querySelectorAll('.paso')[paso - 1].classList.add('activo');
    }
}

function anteriorPaso(paso) {
    // Ocultar paso actual
    document.querySelectorAll('.paso-contenido').forEach(contenido => {
        contenido.classList.remove('activo');
    });
    
    // Mostrar paso anterior
    document.getElementById(`paso-${paso}`).classList.add('activo');
    
    // Actualizar indicadores de pasos
    document.querySelectorAll('.paso').forEach(p => {
        p.classList.remove('activo');
    });
    document.querySelectorAll('.paso')[paso - 1].classList.add('activo');
}

// Validación de formularios por paso
function validarPaso(paso) {
    // Permitir avanzar sin validación estricta para demostración
    return true;
}

// Cambio de método de pago
document.addEventListener('DOMContentLoaded', function() {
        if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }
    const metodosPago = document.querySelectorAll('input[name="pago"]');
    const infoTarjeta = document.getElementById('info-tarjeta');
    
    metodosPago.forEach(metodo => {
        metodo.addEventListener('change', function() {
            if (this.value === 'tarjeta') {
                infoTarjeta.style.display = 'block';
            } else {
                infoTarjeta.style.display = 'none';
            }
        });
    });
    
    // Render del resumen basado en carrito local
    function currency(v){ return `$${(v||0).toLocaleString()}`; }
    function renderResumenCheckout(){
        const items = window.AuraCart ? window.AuraCart.get() : [];
        const list = document.querySelector('.items-resumen');
        if (list){
            list.innerHTML = items.map(it => `
            <div class="item-resumen">
              <img src="${it.image||''}" class="item-imagen" alt="${it.title}">
              <div class="item-info">
                <div class="item-nombre">${it.title}</div>
                <div class="item-detalles">${it.size?('Talla '+it.size+' • '):''}Cantidad: ${it.qty||1}</div>
              </div>
              <div class="item-precio">${currency((parseInt(it.price)||0)*(it.qty||1))}</div>
            </div>`).join('');
        }
        const subtotal = items.reduce((a,it)=> a + (parseInt(it.price)||0)*(it.qty||1), 0);
        const envio = subtotal>100000?0:8000;
        const descuento = 0;
        const total = subtotal + envio - descuento;
        const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
        set('co-subtotal', currency(subtotal));
        set('co-envio', envio===0? 'Gratis': currency(envio));
        set('co-descuento', descuento?('-'+currency(descuento)):'$0');
        set('co-total', currency(total));
    }
    renderResumenCheckout();

    // Manejar envío del formulario (cualquier dato sirve)
    document.getElementById('form-checkout').addEventListener('submit', function(e) {
        e.preventDefault();
        const btnPagar = this.querySelector('button[type="submit"]');
        btnPagar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btnPagar.disabled = true;
        setTimeout(() => {
            const items = window.AuraCart? window.AuraCart.get():[];
            const totalTxt = document.getElementById('co-total')?.textContent || '$0';
            const order = { id: Date.now(), total: totalTxt, items: items, createdAt: new Date().toISOString() };
            localStorage.setItem('aura_last_order', JSON.stringify(order));
            if (window.AuraCart) window.AuraCart.clear();
            window.location.href = 'confirmacion.html';
        }, 1200);
    });
    
    // Cargar modo alto contraste si está activo
    if (localStorage.getItem('altoContraste') === 'true') {
        document.body.classList.add('alto-contraste');
    }
});
