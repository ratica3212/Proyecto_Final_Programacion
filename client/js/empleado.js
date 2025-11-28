// === Página principal del empleado para gestionar entregas ===
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Solo empleados tienen acceso
  if (!token || !usuario || usuario.rol !== 'empleado') {
    return (window.location.href = '/');
  }

  const tabla = document.querySelector('#tabla-pedidos tbody');
  const cardsContainer = document.querySelector('#cards-pedidos');

  try {
    // Obtener pedidos pendientes
    const res = await fetch('/api/empleado/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const pedidos = await res.json();

    // Renderizar pedidos en tabla (PC)
    pedidos.forEach(pedido => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${pedido.id}</td>
        <td>${pedido.cliente}</td>
        <td>${new Date(pedido.creado_en).toLocaleString()}</td>
        <td>${pedido.direccion_entrega}</td>
        <td>${pedido.estado_pago}</td>
        <td>${pedido.estado_entrega}</td>
        <td><button onclick="marcarEntregado(${pedido.id})">Marcar Entregado</button></td>
      `;
      tabla.appendChild(tr);

      // Renderizar pedidos en cards (móvil)
      const card = document.createElement('div');
      card.classList.add('pedido-card');
      card.innerHTML = `
        <p><strong>ID Pedido:</strong> ${pedido.id}</p>
        <p><strong>Cliente:</strong> ${pedido.cliente}</p>
        <p><strong>Fecha:</strong> ${new Date(pedido.creado_en).toLocaleString()}</p>
        <p><strong>Dirección:</strong> ${pedido.direccion_entrega}</p>
        <p><strong>Estado Pago:</strong> ${pedido.estado_pago}</p>
        <p><strong>Estado Entrega:</strong> ${pedido.estado_entrega}</p>
        <button onclick="marcarEntregado(${pedido.id})">Marcar Entregado</button>
      `;
      cardsContainer.appendChild(card);
    });

  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    alert('Error al cargar pedidos pendientes.');
  }

  // Botón de cerrar sesión
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
  });

  // Botón de ver pedidos ya entregados
  const btnVerEntregados = document.getElementById('verEntregados');
  if (btnVerEntregados) {
    btnVerEntregados.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/empleado/entregados', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const entregados = await res.json();
        alert(`Tienes ${entregados.length} pedidos entregados.`);
      } catch (err) {
        alert('Error al cargar pedidos entregados');
        console.error(err);
      }
    });
  }
});

// === Marcar pedido como entregado ===
async function marcarEntregado(pedidoId) {
  const confirmar = confirm('¿Confirmas que este pedido fue entregado?');
  if (!confirmar) return;

  try {
    const res = await fetch(`/api/empleado/pedidos/${pedidoId}/entregar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await res.json();
    alert(data.mensaje);
    location.reload();
  } catch (err) {
    console.error('Error al marcar como entregado:', err);
    alert('No se pudo actualizar el estado del pedido.');
  }
}
