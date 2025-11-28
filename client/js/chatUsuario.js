// === Cargar la vista de chat para el usuario final ===
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const mensajesContainer = document.getElementById('mensajes-usuario');
  const form = document.getElementById('form-usuario');
  const input = document.getElementById('mensaje-usuario');

  // Verifica que el usuario esté autenticado
  if (!token || !usuario) return alert('Debes iniciar sesión');

  let chatId;

  // === Paso 1: Obtener el chat activo del usuario ===
  try {
    const res = await fetch(`/api/chats/por-usuario/${usuario.id}`);
    const data = await res.json();
    chatId = data.id;
  } catch (err) {
    console.error('No se encontró chat activo');
    return;
  }

  // === Paso 2: Cargar los mensajes del chat ===
  async function cargarMensajes() {
    try {
      const res = await fetch(`/api/chats/${chatId}/mensajes`);
      const data = await res.json();
      mensajesContainer.innerHTML = '';

      // Renderiza cada mensaje
      data.mensajes.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('mensaje');
        div.classList.add(msg.remitente === 'soporte' ? 'soporte' : 'usuario');
        div.textContent = msg.contenido;
        mensajesContainer.appendChild(div);
      });

      mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  }

  // === Paso 3: Enviar mensaje del usuario ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contenido = input.value.trim();
    if (!contenido) return;

    try {
      await fetch(`/api/chats/${chatId}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenido, remitente: 'usuario' })
      });

      input.value = '';
      cargarMensajes();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  });

  // === Paso 4: Recargar mensajes cada 5 segundos ===
  cargarMensajes();
  setInterval(cargarMensajes, 5000);
});
