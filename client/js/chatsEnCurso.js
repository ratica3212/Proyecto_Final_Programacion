// === Al cargar la vista de chats en curso ===
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const lista = document.getElementById('lista-chats');

  // Validación de sesión activa
  if (!token) {
    alert('Sesión expirada. Inicia sesión de nuevo.');
    window.location.href = '/';
    return;
  }

  try {
    // Solicita los chats activos al backend
    const res = await fetch('/api/soporte/chats-activos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    lista.innerHTML = '';

    // Si no hay chats, muestra mensaje
    if (data.chats.length === 0) {
      lista.innerHTML = '<p>No hay chats activos.</p>';
      return;
    }

    // Renderiza los chats activos con botón para ingresar
    data.chats.forEach(chat => {
      const div = document.createElement('div');
      div.className = 'chat-entrada';
      div.innerHTML = `
        <p>Usuario: ${chat.nombre_usuario}</p>
        <button onclick="irAlChat(${chat.id})">Ingresar al Chat</button>
      `;
      lista.appendChild(div);
    });
  } catch (err) {
    console.error('❌ Error al obtener chats activos:', err);
    lista.innerHTML = '<p>Error al cargar los chats.</p>';
  }
});

// === Redirección a la vista de chat individual ===
function irAlChat(chatId) {
  window.location.href = `/html/chatSoporte.html?chatId=${chatId}`;
}
