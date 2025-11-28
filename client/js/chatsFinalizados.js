// === Al cargar la vista de chats finalizados ===
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const lista = document.getElementById('lista-chats');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Verificación de sesión y rol de soporte
  if (!token || !usuario || usuario.rol !== 'soporte') {
    alert('Acceso denegado');
    window.location.href = '/';
    return;
  }

  try {
    // Solicita chats finalizados al backend
    const res = await fetch('/api/chats/finalizados', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    lista.innerHTML = '';

    // Si no hay chats finalizados
    if (!data.chats || data.chats.length === 0) {
      lista.innerHTML = '<p>No hay chats finalizados.</p>';
      return;
    }

    // Muestra cada chat finalizado con su fecha
    data.chats.forEach(chat => {
      const div = document.createElement('div');
      div.className = 'chat-entrada';
      div.innerHTML = `
        <p><strong>Usuario:</strong> ${chat.nombre_usuario}</p>
        <p><small>Finalizado el: ${new Date(chat.creado_en).toLocaleString()}</small></p>
        <a href="/html/chatFinalizado.html?chatId=${chat.id}">Ver conversación</a>
      `;
      lista.appendChild(div);
    });

  } catch (err) {
    console.error('❌ Error al obtener chats finalizados:', err);
    lista.innerHTML = '<p>Error al cargar los chats finalizados.</p>';
  }
});
