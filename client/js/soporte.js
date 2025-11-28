// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM necesarios para el widget de soporte
  const iconoSoporte = document.getElementById('icono-soporte');
  const widgetChat = document.getElementById('widget-chat');
  const inputChat = document.getElementById('input-chat');
  const btnEnviar = document.getElementById('btn-enviar-chat');
  const chatMensajes = document.getElementById('chat-mensajes');
  const estadoEspera = document.getElementById('estadoEspera');
  const chatInicial = document.getElementById('chat-inicial');
  const btnHablarAgente = document.getElementById('btn-hablar-agente');
  const btnCerrarChat = document.getElementById('btn-cerrar-chat');

  // Obtiene el usuario y el token desde localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');

  // Variable para almacenar el ID del chat activo
  let chatId = null;

  // Si no hay sesión iniciada, no hace nada
  if (!usuario || !token) return;

  // Evento al hacer clic en el icono de soporte
  iconoSoporte.addEventListener('click', async () => {
    widgetChat.style.display = 'block';

    try {
      // Verifica si ya hay un chat activo para el usuario
      const res = await fetch(`/api/chats/por-usuario/${usuario.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const chat = await res.json();
        chatId = chat.id;

        // Carga los mensajes del chat
        const resMsg = await fetch(`/api/chats/${chatId}/mensajes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const dataMsg = await resMsg.json();

        // Si hay mensajes, muestra el área de conversación
        if (dataMsg.mensajes && dataMsg.mensajes.length > 0) {
          chatInicial.style.display = 'none';
          estadoEspera.style.display = 'none';
          chatMensajes.style.display = 'block';
          inputChat.parentElement.style.display = 'flex';
          cargarMensajes();
        } else {
          // Si no hay mensajes, el usuario está en espera
          chatInicial.style.display = 'none';
          estadoEspera.style.display = 'block';
          chatMensajes.style.display = 'none';
          inputChat.parentElement.style.display = 'none';
          actualizarPosicion();
        }
      } else {
        // Si no hay chat activo, se muestra la pantalla inicial
        chatInicial.style.display = 'block';
        estadoEspera.style.display = 'none';
        chatMensajes.style.display = 'none';
        inputChat.parentElement.style.display = 'none';
      }
    } catch (err) {
      console.error('Error al verificar chat activo:', err);
    }
  });

  // Evento para iniciar una conversación con un agente
  btnHablarAgente.addEventListener('click', async () => {
    if (chatId) {
      estadoEspera.style.display = 'block';
      estadoEspera.textContent = 'Ya estás en la cola, espera a que el soporte te contacte.';
      return;
    }

    chatInicial.style.display = 'none';
    estadoEspera.style.display = 'block';
    chatMensajes.style.display = 'block';
    inputChat.parentElement.style.display = 'flex';

    iniciarSoporte();
  });

  // Evento para cerrar el widget de chat
  btnCerrarChat.addEventListener('click', () => {
    widgetChat.style.display = 'none';
  });

  // Función para colocar al usuario en la cola de soporte
  async function iniciarSoporte() {
    try {
      const res = await fetch('/api/soporte/entrar-en-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario })
      });

      const data = await res.json();
      estadoEspera.style.display = 'block';
      estadoEspera.textContent = `Estás en la posición #${data.posicion} en espera.`;

      verificarChatActivo();
    } catch (err) {
      console.error('Error al entrar en espera:', err);
    }
  }

  // Evento para enviar un mensaje desde el input
  btnEnviar.addEventListener('click', async () => {
    const contenido = inputChat.value.trim();
    if (!contenido || !chatId) return;

    try {
      await fetch(`/api/chats/${chatId}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenido, remitente: 'usuario' })
      });

      inputChat.value = '';
      cargarMensajes();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  });

  // Función para cargar los mensajes del chat en curso
  async function cargarMensajes() {
    if (!chatId) return;

    try {
      const res = await fetch(`/api/chats/${chatId}/mensajes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      chatMensajes.innerHTML = '';

      data.mensajes.forEach(msg => {
        const div = document.createElement('div');
        const remitente = msg.emisor === 'soporte' ? 'Soporte' : msg.nombre_usuario || usuario.nombre;
        div.textContent = `${remitente}: ${msg.contenido}`;
        div.style.marginBottom = '5px';
        chatMensajes.appendChild(div);
      });

      chatMensajes.scrollTop = chatMensajes.scrollHeight;
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  }

  // Función para mostrar al usuario su posición actual en la cola
  async function actualizarPosicion() {
    try {
      const res = await fetch('/api/soporte/cola');
      const data = await res.json();
      const posicion = data.cola.indexOf(usuario.id) + 1;
      if (posicion > 0) {
        estadoEspera.style.display = 'block';
        estadoEspera.textContent = `Estás en la posición #${posicion} en espera.`;
      } else {
        estadoEspera.style.display = 'none';
      }
    } catch (err) {
      console.error('Error al obtener la cola:', err);
    }
  }

  // Verifica periódicamente si el chat ha sido activado y actualiza mensajes
  async function verificarChatActivo() {
    setInterval(async () => {
      actualizarPosicion();

      if (chatId) {
        try {
          const resMsg = await fetch(`/api/chats/${chatId}/mensajes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          const dataMsg = await resMsg.json();

          if (dataMsg.mensajes && dataMsg.mensajes.length > 0) {
            estadoEspera.style.display = 'none';
            chatMensajes.style.display = 'block';
            inputChat.parentElement.style.display = 'flex';
            cargarMensajes();
          }
        } catch (err) {
          console.error('Error al verificar mensajes del chat:', err);
        }

        return;
      }

      try {
        const res = await fetch(`/api/chats/por-usuario/${usuario.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const chat = await res.json();
          chatId = chat.id;

          estadoEspera.style.display = 'block';
          chatMensajes.style.display = 'none';
          inputChat.parentElement.style.display = 'none';
        }
      } catch (err) {
        // No hacer nada si aún no tiene chat
      }
    }, 5000);
  }
});
