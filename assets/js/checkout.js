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
    const pasoActual = document.getElementById(`paso-${paso + 1}`);
    const inputs = pasoActual.querySelectorAll('input[required]');
    
    let valido = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--rojo-neon)';
            valido = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return valido;
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
    
    // Manejar envío del formulario
    document.getElementById('form-checkout').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar términos y condiciones
        const terminos = document.getElementById('terminos');
        if (!terminos.checked) {
            alert('Debes aceptar los términos y condiciones para continuar.');
            return;
        }
        
        // Simular procesamiento de pago
        const btnPagar = this.querySelector('button[type="submit"]');
        const textoOriginal = btnPagar.innerHTML;
        
        btnPagar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btnPagar.disabled = true;
        
        // Simular delay de procesamiento
        setTimeout(() => {
            alert('¡Pago procesado exitosamente! Tu pedido ha sido confirmado.');
            window.location.href = 'confirmacion.html'; // Redirigir a página de confirmación
        }, 2000);
    });
    
    // Cargar modo alto contraste si está activo
    if (localStorage.getItem('altoContraste') === 'true') {
        document.body.classList.add('alto-contraste');
    }
});