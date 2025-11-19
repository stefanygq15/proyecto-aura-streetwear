document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('altoContraste') === 'true') {
    document.body.classList.add('alto-contraste');
  }

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(`${tabId}-content`).classList.add('active');
    });
  });

  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      if (icon) {
        icon.classList.toggle('fa-eye', !isPassword);
        icon.classList.toggle('fa-eye-slash', isPassword);
      }
    });
  });

  const loginForm = document.querySelector('#login-content .login-form');
  const registerForm = document.querySelector('#register-content .login-form');
  const loginMessage = document.getElementById('loginMessage');
  const registerMessage = document.getElementById('registerMessage');

  function setMessage(el, text, type = 'error') {
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('success', type === 'success');
  }

  if (loginForm) {
    const loginSubmitBtn = loginForm.querySelector('button[type="submit"]');
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const rawEmail = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const email = rawEmail.includes('@') ? rawEmail : `${rawEmail}@aura.com`;

      if (!email || !password) {
        setMessage(loginMessage, 'Debes ingresar tu usuario y contraseña');
        return;
      }

      setMessage(loginMessage, '');
      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Validando...';
      }

      try {
        const res = await fetch('api/auth/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          throw new Error(data.error || 'No pudimos iniciar sesión');
        }
        setMessage(loginMessage, 'Sesión iniciada, redirigiendo...', 'success');
        if (window.refreshAuraSession) {
          window.refreshAuraSession();
        }
        setTimeout(() => {
          window.location.href = 'perfil.html';
        }, 600);
      } catch (err) {
        setMessage(loginMessage, err.message || 'Error al iniciar sesión');
      } finally {
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = 'Iniciar Sesión';
        }
      }
    });
  }

  if (registerForm) {
    const registerSubmit = registerForm.querySelector('button[type="submit"]');
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value;

      if (!username || !password) {
        setMessage(registerMessage, 'Ingresa un usuario y contraseña válidos.');
        return;
      }

      setMessage(registerMessage, '');
      if (registerSubmit) {
        registerSubmit.disabled = true;
        registerSubmit.textContent = 'Creando cuenta...';
      }

      const email = username.includes('@') ? username : `${username}@aura.com`;

      try {
        const res = await fetch('api/auth/register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: username,
            email,
            password
          })
        });
        const data = await res.json();
        if (!res.ok || !data.registered) {
          throw new Error(data.error || 'No pudimos crear tu cuenta');
        }
        setMessage(registerMessage, 'Cuenta creada, redirigiendo...', 'success');
        if (window.refreshAuraSession) window.refreshAuraSession();
        setTimeout(() => window.location.href = 'perfil.html', 800);
      } catch (error) {
        setMessage(registerMessage, error.message || 'Error al registrar');
      } finally {
        if (registerSubmit) {
          registerSubmit.disabled = false;
          registerSubmit.textContent = 'Crear Cuenta';
        }
      }
    });
  }

});
