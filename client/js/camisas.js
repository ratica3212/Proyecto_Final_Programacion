// Espera que el DOM esté completamente cargado para comenzar a ejecutar la lógica
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('productos-container');

  try {
    // Solicita todos los productos al backend
    const res = await fetch('/api/productos');
    const productos = await res.json();

    // Filtra solo los productos cuya categoría es "Camisas"
    const camisas = productos.filter(p => p.categoria === 'Camisas');

    // Si no hay camisas, muestra un mensaje
    if (camisas.length === 0) {
      container.innerHTML = '<p>No hay camisas disponibles en este momento.</p>';
      return;
    }

    // Crea una tarjeta por cada camisa y la añade al contenedor
    camisas.forEach(p => {
      const card = document.createElement('div');
      card.classList.add('producto-card');
      card.setAttribute('data-id', p.id); // atributo para localizar el producto

      card.innerHTML = `
        <img src="${p.imagen_url}" alt="${p.nombre}" />
        <div class="contenido-producto">
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <p><strong>$${p.precio}</strong></p>
        </div>
        <div class="cantidad-bloque">
          <input type="number" min="1" value="1" class="cantidad-input" />
          <button onclick="agregarAlCarrito(${p.id})">Agregar al carrito</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    // En caso de error al cargar los productos, se informa en pantalla
    container.innerHTML = '<p>Error al cargar los productos.</p>';
    console.error(err);
  }
});

// Función para agregar un producto específico al carrito
async function agregarAlCarrito(productoId) {
  const token = localStorage.getItem('token');

  // Si no hay token, el usuario no ha iniciado sesión
  if (!token) {
    alert("Debes iniciar sesión para agregar productos.");
    return;
  }

  // Localiza la tarjeta del producto y obtiene la cantidad seleccionada
  const productoCard = document.querySelector(`[data-id="${productoId}"]`);
  const cantidadInput = productoCard.querySelector('.cantidad-input');
  const cantidad = parseInt(cantidadInput.value) || 1;

  try {
    // Envia la solicitud al backend para agregar el producto al carrito
    const res = await fetch('/api/carrito/agregar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ producto_id: productoId, cantidad })
    });

    const data = await res.json();

    // Muestra mensaje según si fue exitoso o no
    if (res.ok) {
      alert('Producto agregado al carrito');
    } else {
      alert(data.mensaje || 'Error al agregar al carrito');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al agregar al carrito');
  }
}
