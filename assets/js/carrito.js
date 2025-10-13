function cambiarCantidad(button, cambio) {
    const item = button.closest('.item-carrito');
    const input = item.querySelector('.cantidad-input');
    let cantidad = parseInt(input.value);
    
    cantidad += cambio;
    
    if (cantidad < 1) cantidad = 1;
    if (cantidad > 10) cantidad = 10;
    
    input.value = cantidad;
    actualizarSubtotal(item);
    actualizarResumen();
}

function eliminarItem(button) {
    const item = button.closest('.item-carrito');
    item.style.animation = 'slideOut 0.3s ease';
    
    setTimeout(() => {
        item.remove();
        actualizarResumen();
        verificarCarritoVacio();
    }, 300);
}

function actualizarSubtotal(item) {
    const precioTexto = item.querySelector('.item-precio').textContent;
    const precio = parseInt(precioTexto.replace('$', '').replace('.', ''));
    const cantidad = parseInt(item.querySelector('.cantidad-input').value);
    const subtotal = precio * cantidad;
    
    item.querySelector('.item-subtotal').textContent = `$${subtotal.toLocaleString()}`;
}

function actualizarResumen() {
    const items = document.querySelectorAll('.item-carrito');
    let subtotal = 0;
    
    items.forEach(item => {
        const subtotalTexto = item.querySelector('.item-subtotal').textContent;
        subtotal += parseInt(subtotalTexto.replace('$', '').replace('.', ''));
    });
    
    const envio = subtotal > 100000 ? 0 : 8000;
    const descuento = 10000;
    const total = subtotal + envio - descuento;
    
    document.querySelector('.resumen-linea:nth-child(1) span:last-child').textContent = `$${subtotal.toLocaleString()}`;
    document.querySelector('.resumen-linea:nth-child(2) span:last-child').textContent = envio === 0 ? 'Gratis' : `$${envio.toLocaleString()}`;
    document.querySelector('.resumen-linea:nth-child(3) span:last-child').textContent = `-$${descuento.toLocaleString()}`;
    document.querySelector('.resumen-linea.total span:last-child').textContent = `$${total.toLocaleString()}`;
}

function verificarCarritoVacio() {
    const items = document.querySelectorAll('.item-carrito');
    const carritoVacio = document.getElementById('carrito-vacio');
    const listaItems = document.getElementById('lista-items');
    
    if (items.length === 0) {
        carritoVacio.style.display = 'block';
        listaItems.style.display = 'none';
    } else {
        carritoVacio.style.display = 'none';
        listaItems.style.display = 'flex';
    }
}

function irACheckout() {
    window.location.href = 'checkout.html';
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }
    actualizarResumen();
    verificarCarritoVacio();
});

// Animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);