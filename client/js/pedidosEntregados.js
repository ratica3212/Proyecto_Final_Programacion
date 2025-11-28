// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
  // Obtiene token y usuario desde localStorage
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Redirige si el usuario no está autenticado o no es empleado
  if (!token || !usuario || usuario.rol !== 'empleado') {
    return (window.location.href = '/');
  }

  // Selecciona los contenedores para la tabla y las tarjetas (cards)
  const tabla = document.querySelector('#tabla-entregados tbody');
  const cardsContainer = document.getElementById('cards-entregados');

  try {
    // Consulta los pedidos ya entregados desde el backend
    const res = await fetch('/api/empleado/entregados', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Lanza error si la respuesta no es exitosa
    if (!res.ok) throw new Error('Respuesta no satisfactoria del servidor');

    // Obtiene los datos y los ordena por ID ascendente
    const pedidos = await res.json();
    pedidos.sort((a, b) => a.id - b.id);

    // Limpia los contenedores de tabla y cards
    tabla.innerHTML = "";
    cardsContainer.innerHTML = "";

    // Si no hay pedidos entregados, muestra un mensaje
    if (pedidos.length === 0) {
      tabla.innerHTML = `<tr><td colspan="6">No hay pedidos entregados.</td></tr>`;
      cardsContainer.innerHTML = `<p>No hay pedidos entregados.</p>`;
      return;
    }

    // Recorre los pedidos entregados y los renderiza en tabla y cards
    pedidos.forEach(p => {
      // Construye la fila de la tabla
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.cliente}</td>
        <td>${new Date(p.creado_en).toLocaleString()}</td>
        <td>$${p.total}</td>
        <td>${p.estado_pago}</td>
        <td>${p.estado_entrega}</td>
      `;
      tabla.appendChild(tr);

      // Construye la tarjeta para móviles
      const card = document.createElement('div');
      card.classList.add('pedido-card');
      card.innerHTML = `
        <h3>Pedido #${p.id}</h3>
        <div class="pedido-item"><strong>Cliente:</strong> ${p.cliente}</div>
        <div class="pedido-item"><strong>Fecha:</strong> ${new Date(p.creado_en).toLocaleString()}</div>
        <div class="pedido-item"><strong>Total:</strong> $${p.total}</div>
        <div class="pedido-item"><strong>Pago:</strong> ${p.estado_pago}</div>
        <div class="pedido-item"><strong>Entrega:</strong> ${p.estado_entrega}</div>
      `;
      cardsContainer.appendChild(card);
    });

  } catch (err) {
    // Manejo de error si no se pudieron cargar los pedidos
    console.error('Error al cargar pedidos entregados:', err);
    alert('No se pudieron cargar los pedidos entregados.');
  }

  // Cierre de sesión
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
  });
});
