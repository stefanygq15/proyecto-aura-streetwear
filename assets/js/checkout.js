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
    let resumenActual = { subtotal: 0, envio: 0, descuento: 0, total: 0 };
    
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
        resumenActual = { subtotal, envio, descuento, total };
        const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
        set('co-subtotal', currency(subtotal));
        set('co-envio', envio===0? 'Gratis': currency(envio));
        set('co-descuento', descuento?('-'+currency(descuento)):'$0');
        set('co-total', currency(total));
    }
    renderResumenCheckout();

    // Manejar envío del formulario (cualquier dato sirve)
    const form = document.getElementById('form-checkout');
    if (!form) return;

    function showCheckoutMessage(msg, type = 'error') {
        let alert = document.getElementById('checkoutMessage');
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'checkoutMessage';
            alert.className = 'checkout-alert';
            form.prepend(alert);
        }
        alert.textContent = msg;
        alert.classList.toggle('success', type === 'success');
    }

    function clearCheckoutMessage() {
        const alert = document.getElementById('checkoutMessage');
        if (alert) alert.textContent = '';
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btnPagar = this.querySelector('button[type="submit"]');
        const items = window.AuraCart ? window.AuraCart.get() : [];
        if (!items.length) {
            showCheckoutMessage('Tu carrito está vacío.');
            return;
        }
        if (!form.terminos?.checked) {
            showCheckoutMessage('Debes aceptar los términos y condiciones.');
            return;
        }

        clearCheckoutMessage();
        btnPagar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btnPagar.disabled = true;

        const payload = {
            shipping: {
                name: form.nombre.value.trim(),
                email: form.email.value.trim(),
                phone: form.telefono.value.trim(),
                document: form.documento.value.trim(),
                address: form.direccion.value.trim(),
                city: form.ciudad.value.trim(),
                state: form.departamento.value.trim(),
                zip: form['codigo-postal']?.value.trim(),
                notes: ''
            },
            payment_method: form.querySelector('input[name="pago"]:checked')?.value || 'sin-definir',
            shipping_method: 'standard',
            items: items.map(it => ({
                id: it.id || null,
                slug: it.slug || null,
                title: it.title,
                price: parseInt(it.price, 10) || 0,
                qty: it.qty || 1,
                size: it.size || '',
                image: it.image || ''
            })),
            summary: { ...resumenActual, items_count: items.reduce((a,it)=> a + (it.qty || 1), 0) }
        };

        try {
            const res = await fetch('api/orders/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.status === 401) {
                window.location.href = 'login.html?redirect=checkout';
                return;
            }
            if (!res.ok || !data.order) {
                throw new Error(data.error || 'No pudimos registrar tu pedido');
            }
            localStorage.setItem('aura_last_order', JSON.stringify({
                ...data.order,
                summary: payload.summary
            }));
            if (window.AuraCart) window.AuraCart.clear();
            showCheckoutMessage('Pedido registrado. Redirigiendo...', 'success');
            setTimeout(() => window.location.href = 'confirmacion.html', 600);
        } catch (error) {
            showCheckoutMessage(error.message || 'Error al procesar el pago');
        } finally {
            btnPagar.innerHTML = 'Pagar ahora <i class="fas fa-lock"></i>';
            btnPagar.disabled = false;
        }
    });
    
    // Cargar modo alto contraste si está activo
    if (localStorage.getItem('altoContraste') === 'true') {
        document.body.classList.add('alto-contraste');
    }
});
