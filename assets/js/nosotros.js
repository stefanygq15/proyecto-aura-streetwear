document.addEventListener('DOMContentLoaded', function () {
    // Animación de contadores para logros
    if (localStorage.getItem('altoContraste') === 'true') {
        document.body.classList.add('alto-contraste');
    }
    function animarContadores() {
        const contadores = document.querySelectorAll('.numero-logro');
        const velocidad = 2000; // Duración en milisegundos

        contadores.forEach(contador => {
            const objetivo = +contador.getAttribute('data-objetivo') || parseInt(contador.textContent);
            const incremento = objetivo / (velocidad / 16);
            let valorActual = 0;

            const actualizarContador = () => {
                if (valorActual < objetivo) {
                    valorActual += incremento;
                    contador.textContent = Math.ceil(valorActual) + (contador.textContent.includes('+') ? '+' : '');
                    setTimeout(actualizarContador, 16);
                } else {
                    contador.textContent = objetivo + (contador.textContent.includes('+') ? '+' : '');
                }
            };

            // Solo animar cuando el elemento sea visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        contador.textContent = '0';
                        actualizarContador();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(contador);
        });
    }

    // Efecto parallax suave para el hero
    function efectoParallax() {
        const hero = document.querySelector('.hero-nosotros');
        if (hero) {
            window.addEventListener('scroll', function () {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            });
        }
    }

    // Animación de aparición para las secciones
    function animarAlScroll() {
        const elementos = document.querySelectorAll('.card-mv, .paso, .miembro-equipo, .logro-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elementos.forEach(elemento => {
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateY(30px)';
            elemento.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(elemento);
        });
    }

    // Efecto hover mejorado para tarjetas
    function efectosHover() {
        const tarjetas = document.querySelectorAll('.card-mv, .miembro-equipo, .paso');

        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener('mouseenter', function () {
                this.style.boxShadow = '0 20px 40px rgba(0, 208, 132, 0.2)';
            });

            tarjeta.addEventListener('mouseleave', function () {
                this.style.boxShadow = 'var(--sombra)';
            });
        });
    }

    // Navegación suave para enlaces internos
    function navegacionSuave() {
        const enlaces = document.querySelectorAll('a[href^="#"]');

        enlaces.forEach(enlace => {
            enlace.addEventListener('click', function (e) {
                e.preventDefault();
                const objetivo = document.querySelector(this.getAttribute('href'));
                if (objetivo) {
                    objetivo.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Inicializar todas las funciones
    function init() {
        animarContadores();
        efectoParallax();
        animarAlScroll();
        efectosHover();
        navegacionSuave();

        // Agregar data-objetivo a los contadores
        document.querySelectorAll('.numero-logro').forEach(contador => {
            const valor = contador.textContent.replace('+', '');
            contador.setAttribute('data-objetivo', valor);
            contador.textContent = '0';
        });
    }

    init();

    // Efecto de escritura para el hero (opcional)
    function efectoEscritura() {
        const subtitulo = document.querySelector('.hero-subtitulo');
        if (subtitulo) {
            const textoOriginal = subtitulo.textContent;
            subtitulo.textContent = '';
            let i = 0;

            function escribir() {
                if (i < textoOriginal.length) {
                    subtitulo.textContent += textoOriginal.charAt(i);
                    i++;
                    setTimeout(escribir, 50);
                }
            }

            // Iniciar escritura cuando el elemento sea visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        escribir();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(subtitulo);
        }
    }

    // Descomenta la siguiente línea si quieres el efecto de escritura
    // efectoEscritura();
});

// Efectos de partículas para el fondo (opcional)
function crearParticulas() {
    const hero = document.querySelector('.hero-nosotros');
    if (!hero) return;

    for (let i = 0; i < 50; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula';
        particula.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--verde-neon);
            border-radius: 50%;
            opacity: ${Math.random() * 0.6 + 0.2};
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 5}s linear infinite;
        `;
        hero.appendChild(particula);
    }

    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            50% {
                opacity: 0.8;
            }
            100% {
                transform: translateY(-100px) translateX(20px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Descomenta la siguiente línea para activar las partículas
// crearParticulas();