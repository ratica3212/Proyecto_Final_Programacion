// Espera a que el documento HTML se cargue completamente
document.addEventListener('DOMContentLoaded', async () => {
  // Se obtiene el contenedor donde se mostrarán los productos
  const container = document.getElementById('productos-container');

  try {
    // Se hace una solicitud al backend para obtener todos los productos
    const res = await fetch('/api/productos');
    const productos = await res.json();

    // Se filtran los productos que pertenecen a la categoría "Pantalones"
    const pantalones = productos.filter(p => p.categoria === 'Pantalones');

    // Si no hay pantalones disponibles, se muestra un mensaje al usuario
    if (pantalones.length === 0) {
      container.innerHTML = '<p>No hay pantalones disponibles en este momento.</p>';
      return;
    }

    // Se crea una tarjeta (card) HTML por cada pantalón y se agrega al contenedor
    pantalones.forEach(p => {
      const card = document.createElement('div');
      card.classList.add('producto-card'); // clase para aplicar estilos
      card.setAttribute('data-id', p.id); // se guarda el ID como atributo personalizado

      // Contenido de la tarjeta: imagen, nombre, descripción, precio, input de cantidad y botón
      card.innerHTML = `
        <img src="${p.imagen_url}" alt="${p.nombre}" />
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p><strong>$${p.precio}</strong></p>
        <div class="cantidad-bloque">
          <input type="number" min="1" value="1" class="cantidad-input" />
          <button onclick="agregarAlCarrito(${p.id})">Agregar al carrito</button>
        </div>
      `;

      // Se agrega la tarjeta al contenedor
      container.appendChild(card);
    });

  } catch (err) {
    // Si ocurre un error en la solicitud o procesamiento, se muestra un mensaje de error
    container.innerHTML = '<p>Error al cargar los productos.</p>';
    console.error(err);
  }
});

// Función que agrega un producto específico al carrito
async function agregarAlCarrito(productoId) {
  const token = localStorage.getItem('token');

  // Si el usuario no está autenticado, se muestra una alerta
  if (!token) {
    alert("Debes iniciar sesión para agregar productos.");
    return;
  }

  // Se busca la tarjeta correspondiente al producto
  const productoCard = document.querySelector(`[data-id="${productoId}"]`);

  // Se obtiene el valor del input de cantidad
  const cantidadInput = productoCard.querySelector('.cantidad-input');
  const cantidad = parseInt(cantidadInput.value) || 1;

  try {
    // Se envía una solicitud POST al backend para agregar el producto al carrito
    const res = await fetch('/api/carrito/agregar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ producto_id: productoId, cantidad })
    });

    const data = await res.json();

    // Si la solicitud fue exitosa, se notifica al usuario
    if (res.ok) {
      alert('Producto agregado al carrito');
    } else {
      // Si hubo un error (por ejemplo, falta de stock), se muestra el mensaje del backend
      alert(data.mensaje || 'Error al agregar al carrito');
    }
  } catch (error) {
    // Se captura cualquier error de red u otro tipo
    console.error('Error:', error);
    alert('Error al agregar al carrito');
  }
}
