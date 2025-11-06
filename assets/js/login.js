document.addEventListener('DOMContentLoaded', function() {
    // Tabs functionality
    if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Form validation
    const loginForm = document.querySelector('#login-content .login-form');
    const registerForm = document.querySelector('#register-content .login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value || 'usuario@demo.com';
            // Simular login exitoso con cualquier dato
            const user = { email, name: email.split('@')[0], loggedAt: Date.now() };
            localStorage.setItem('aura_user', JSON.stringify(user));
            // Redirigir a la portada o perfil
            window.location.href = 'perfil.html';
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            const email = document.getElementById('register-email').value || 'usuario@demo.com';
            const nombre = document.getElementById('register-nombre').value || 'Usuario';
            const user = { email, name: nombre, loggedAt: Date.now() };
            localStorage.setItem('aura_user', JSON.stringify(user));
            window.location.href = 'perfil.html';
        });
    }
    
    // Social login buttons
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            const user = { email: provider.toLowerCase()+"@demo.com", name: provider+" User", loggedAt: Date.now() };
            localStorage.setItem('aura_user', JSON.stringify(user));
            window.location.href = 'perfil.html';
        });
    });
});
