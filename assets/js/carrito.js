// Render del carrito de la página usando el storage global (AuraCart)
function currency(v){return `$${(v||0).toLocaleString()}`}

function renderCarritoPagina(){
  const lista = document.getElementById('lista-items');
  const vacio = document.getElementById('carrito-vacio');
  if (!lista) return;
  const cart = window.AuraCart ? window.AuraCart.get() : [];
  lista.innerHTML = '';
  if (!cart.length){
    if (vacio) vacio.style.display = 'block';
    lista.style.display = 'none';
  } else {
    if (vacio) vacio.style.display = 'none';
    lista.style.display = 'flex';
    cart.forEach((it, idx) => {
      const el = document.createElement('div');
      el.className = 'item-carrito';
      el.innerHTML = `
        <div class="item-imagen"><img src="${it.image||''}" alt="${it.title}"></div>
        <div class="item-info">
          <h3>${it.title}</h3>
          <p class="item-detalles">${it.size?('Talla: '+it.size+' • '):''}</p>
          <p class="item-precio">${currency(it.price)}</p>
        </div>
        <div class="item-cantidad">
          <button class="btn-cantidad" data-idx="${idx}" data-delta="-1">-</button>
          <input type="number" value="${it.qty||1}" min="1" class="cantidad-input" disabled>
          <button class="btn-cantidad" data-idx="${idx}" data-delta="1">+</button>
        </div>
        <div class="item-subtotal">${currency((it.qty||1)*(parseInt(it.price)||0))}</div>
        <div class="item-eliminar"><button class="btn-eliminar" data-remove="${idx}"><i class="fas fa-trash"></i></button></div>`;
      lista.appendChild(el);
    });
  }
  actualizarResumenPagina();
  if (window.updateCartBadge) window.updateCartBadge();
}

function actualizarResumenPagina(){
  const cart = window.AuraCart ? window.AuraCart.get() : [];
  const subtotal = cart.reduce((a,it)=> a + (parseInt(it.price)||0)*(it.qty||1),0);
  const envio = subtotal>100000?0:8000;
  const descuento = 0;
  const total = subtotal+envio-descuento;
  const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent = val; };
  set('subtotal-cifra', currency(subtotal));
  set('envio-cifra', envio===0? 'Gratis': currency(envio));
  set('descuento-cifra', descuento?('-'+currency(descuento)): '$0');
  set('total-cifra', currency(total));
}

function irACheckout(){ window.location.href = 'checkout.html'; }

document.addEventListener('DOMContentLoaded', () =>{
  if (localStorage.getItem('altoContraste') === 'true') document.body.classList.add('alto-contraste');
  renderCarritoPagina();
  // Delegación para cantidad
  document.body.addEventListener('click', (e)=>{
    const minusPlus = e.target.closest('.btn-cantidad');
    if (minusPlus){
      const idx = parseInt(minusPlus.getAttribute('data-idx'));
      const delta = parseInt(minusPlus.getAttribute('data-delta'));
      if (window.AuraCart){
        const items = window.AuraCart.get();
        const current = items[idx];
        if (current){
          const newQty = (current.qty||1)+delta;
          if (newQty<=0){ items.splice(idx,1); window.AuraCart.save(items); }
          else { current.qty = newQty; window.AuraCart.save(items); }
          renderCarritoPagina(); if (window.openCartOverlay) window.openCartOverlay();
        }
      }
    }
    const remove = e.target.closest('[data-remove]');
    if (remove){
      const idx = parseInt(remove.getAttribute('data-remove'));
      const items = window.AuraCart? window.AuraCart.get():[];
      items.splice(idx,1); if(window.AuraCart) window.AuraCart.save(items);
      renderCarritoPagina();
    }
  });
  const vaciar = document.getElementById('vaciar-carrito');
  if (vaciar){ vaciar.onclick = () => { if (window.AuraCart){ window.AuraCart.clear(); renderCarritoPagina(); if (window.updateCartBadge) window.updateCartBadge(); } } }
});

// Animación CSS (slideOut reutilizable)
const style = document.createElement('style');
style.textContent = `@keyframes slideOut {from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-100%)}}`;
document.head.appendChild(style);
