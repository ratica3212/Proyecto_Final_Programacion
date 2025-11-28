// Se obtiene el token JWT del almacenamiento local para autenticación en las solicitudes
const token = localStorage.getItem('token');

// Función que carga todos los pedidos del usuario autenticado
async function cargarPedidos() {
  try {
    // Se hace una solicitud GET al backend para obtener los pedidos del usuario
    const res = await fetch('/api/pedidos', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    // Se convierte la respuesta en JSON
    const pedidos = await res.json();

    // Se obtiene el contenedor del DOM donde se mostrarán los pedidos
    const cont = document.getElementById('pedidos-container');

    // Si no hay pedidos, se muestra un mensaje indicando que no hay registros
    if (pedidos.length === 0) {
      cont.innerHTML = '<p>No tienes pedidos registrados.</p>';
      return;
    }

    // Se recorre cada pedido para construir su respectiva tarjeta HTML
    pedidos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'pedido-card';

      // Se genera el HTML del pedido, incluyendo un botón para pagar si el estado de pago es "pendiente"
      div.innerHTML = `
        <p><strong>ID:</strong> ${p.id}</p>
        <p><strong>Total:</strong> $${p.total}</p>
        <p><strong>Fecha:</strong> ${new Date(p.creado_en).toLocaleString()}</p>
        <p><strong>Estado de pago:</strong> <span class="estado ${p.estado_pago}">${p.estado_pago}</span></p>
        <p><strong>Dirección:</strong> ${p.direccion_entrega}</p>
        <p><strong>Estado de entrega:</strong> <span class="estado ${p.estado_entrega}">${p.estado_entrega}</span></p>
        ${p.estado_pago === 'pendiente' ? `<button onclick="pagarPedido(${p.id})">Pagar</button>` : ''}
      `;

      // Se agrega la tarjeta al contenedor principal
      cont.appendChild(div);
    });

  } catch (err) {
    // Si hay un error en la solicitud, se muestra en consola
    console.error('Error al obtener pedidos:', err);
  }
}

// Función que se ejecuta cuando el usuario desea pagar un pedido pendiente
async function pagarPedido(id) {
  try {
    // Se hace una solicitud PATCH para cambiar el estado de pago del pedido a "pagado"
    const res = await fetch(`/api/pedidos/${id}/pagar`, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    // Se muestra el mensaje de respuesta y se recarga la página para actualizar el estado
    const data = await res.json();
    alert(data.mensaje);
    location.reload();

  } catch (err) {
    // Se captura y muestra cualquier error que ocurra al intentar pagar el pedido
    console.error('Error al pagar pedido:', err);
  }
}

// Evento que cierra sesión al hacer clic en el botón "logout"
document.getElementById('logout').addEventListener('click', () => {
  // Se elimina el token de autenticación
  localStorage.removeItem('token');

  // Se redirige al usuario a la página de login
  window.location.href = '/client/html/iniciarSesion.html';
});

// Cuando el documento esté completamente cargado, se llama a la función cargarPedidos
document.addEventListener('DOMContentLoaded', cargarPedidos);
