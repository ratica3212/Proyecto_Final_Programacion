// === Al cargar la página ===
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const chatId = params.get('chatId');

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const contenedor = document.getElementById('mensajes-chat');

  // Verifica si el acceso es válido (token, usuario y rol soporte)
  if (!chatId || !token || !usuario || usuario.rol !== 'soporte') {
    alert('Acceso denegado');
    window.location.href = '/';
    return;
  }

  try {
    // Solicita los mensajes del chat finalizado
    const res = await fetch(`/api/chats/${chatId}/mensajes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    contenedor.innerHTML = '';

    // Si no hay mensajes, muestra mensaje de aviso
    if (!data.mensajes || data.mensajes.length === 0) {
      contenedor.innerHTML = '<p>No hay mensajes en esta conversación.</p>';
      return;
    }

    // Muestra cada mensaje con estilo diferente según el emisor
    data.mensajes.forEach(msg => {
      const div = document.createElement('div');
      div.classList.add('mensaje');
      div.classList.add(msg.emisor === 'soporte' ? 'soporte' : 'usuario');

      div.textContent = `${msg.nombre_usuario || 'Usuario'}: ${msg.contenido}`;
      contenedor.appendChild(div);
    });
  } catch (err) {
    // Error al cargar la conversación
    console.error('❌ Error al cargar mensajes:', err);
    contenedor.innerHTML = '<p>Error al cargar la conversación.</p>';
  }
});
