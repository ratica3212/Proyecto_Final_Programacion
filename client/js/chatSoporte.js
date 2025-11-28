// === Lógica del panel de chat en vivo para soporte ===
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const chatId = params.get('chatId');

  const mensajesContainer = document.getElementById('mensajes');
  const formulario = document.getElementById('form-chat');
  const inputMensaje = document.getElementById('mensaje');
  const btnFinalizar = document.getElementById('finalizar-chat');

  const token = localStorage.getItem('token');

  // Validación de sesión y chat válido
  if (!chatId || !token) {
    alert('Chat no válido o sesión expirada.');
    window.location.href = '/';
    return;
  }

  let nombreUsuario = 'Usuario';

  // === Carga de mensajes del chat actual ===
  async function cargarMensajes() {
    try {
      const res = await fetch(`/api/chats/${chatId}/mensajes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      nombreUsuario = data.nombreUsuario || 'Usuario';

      mensajesContainer.innerHTML = '';

      // Renderiza cada mensaje del historial
      data.mensajes.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('mensaje');
        div.classList.add(msg.emisor === 'soporte' ? 'soporte' : 'usuario');

        const remitente = msg.emisor === 'soporte' ? 'Soporte' : msg.nombre_usuario || nombreUsuario;
        div.textContent = `${remitente}: ${msg.contenido}`;

        mensajesContainer.appendChild(div);
      });

      mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
    } catch (err) {
      console.error('❌ Error al cargar mensajes:', err);
      mensajesContainer.innerHTML = '<p>Error al cargar mensajes.</p>';
    }
  }

  // === Envío de nuevo mensaje desde soporte ===
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contenido = inputMensaje.value.trim();
    if (!contenido) return;

    try {
      await fetch(`/api/chats/${chatId}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenido, remitente: 'soporte' })
      });

      inputMensaje.value = '';
      cargarMensajes();
    } catch (err) {
      console.error('❌ Error al enviar mensaje:', err);
    }
  });

  // === Finalizar la atención del chat actual ===
  btnFinalizar.addEventListener('click', async () => {
    if (!confirm('¿Deseas finalizar esta atención?')) return;

    try {
      await fetch(`/api/chats/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ chat_id: chatId })
      });

      alert('✅ Atención finalizada.');
      window.location.href = '/html/chatsFinalizados.html';
    } catch (err) {
      console.error('❌ Error al finalizar atención:', err);
    }
  });

  // Inicializar carga de mensajes y auto-actualización
  cargarMensajes();
  setInterval(cargarMensajes, 5000);
});
