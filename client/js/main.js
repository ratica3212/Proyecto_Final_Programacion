// === Inicializa elementos comunes de la navegación y el login ===
document.addEventListener('DOMContentLoaded', () => 
{
  const linkCarrito = document.getElementById('link-carrito');
  const linkLogin = document.getElementById('link-login');
  const linkRegister = document.getElementById('link-register');
  const carritoIcono = document.getElementById('carrito-icono');
  const volverAdmin = document.getElementById('volver-admin'); // NUEVO
  const cerrarSesionLink = document.getElementById('cerrar-sesion'); // NUEVO
  const token = localStorage.getItem('token');

  // Muestra u oculta enlaces según si el usuario está logueado
  if (linkCarrito && linkLogin && linkRegister) {
    if (token) {
      linkCarrito.style.display = 'inline-block';
      linkLogin.style.display = 'none';
      linkRegister.style.display = 'none';
    } else {
      linkCarrito.style.display = 'none';
      linkLogin.style.display = 'inline-block';
      linkRegister.style.display = 'inline-block';
    }
  }

  // Mostrar ícono del carrito si hay sesión activa
  if (token && carritoIcono) {
    carritoIcono.style.display = 'inline-block';
  }

  // NUEVO: Mostrar "Volver al panel" solo si el usuario es admin
  if (volverAdmin) {
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
      const rol = usuario?.rol;

      // También permite forzar desde querystring ?from=admin (opcional)
      const params = new URLSearchParams(window.location.search);
      const fromAdmin = params.get('from') === 'admin';

      if (rol === 'admin' || fromAdmin) {
        volverAdmin.style.display = 'inline-block';
      } else {
        volverAdmin.style.display = 'none';
      }
    } catch (e) {
      // Si falla el parse, no mostramos el enlace
      volverAdmin.style.display = 'none';
    }
  }

  // NUEVO: Cerrar sesión limpiando storage
  if (cerrarSesionLink) {
    cerrarSesionLink.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      } finally {
        window.location.href = '/';
      }
    });
  }

  

  // === Lógica de inicio de sesión ===
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const correo = formData.get('correo');
      const contraseña = formData.get('contraseña');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo, contraseña })
        });

        const data = await response.json();

        // Si las credenciales son válidas, redirige por rol
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          const rol = data.usuario.rol;
          if (rol === 'admin') {
            window.location.href = '/html/admin.html';
          } else if (rol === 'empleado') {
            window.location.href = '/html/empleado.html';
          } else if (rol === 'soporte') {
            window.location.href = '/html/soporte.html';
          } else {
            window.location.href = '/html/catalogo.html';
          }
        } else {
          alert(data.mensaje || 'Credenciales inválidas');
        }
      } catch (err) {
        console.error('Error al iniciar sesión:', err);
        alert('Hubo un error al intentar iniciar sesión');
      }
    });
  }
});
