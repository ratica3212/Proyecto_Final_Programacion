// Carga los productos existentes desde el backend y los muestra en la tabla
async function cargarProductos() {
  try {
    const res = await fetch('/api/productos');
    const productos = await res.json();
    const tbody = document.querySelector('#tabla-productos tbody');
    tbody.innerHTML = '';

    productos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>$${p.precio}</td>
        <td>${p.stock}</td>
        <td>${p.categoria_id}</td>
        <td><button onclick="eliminarProducto(${p.id})">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

// Elimina un producto del sistema si el usuario confirma la acción
async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/api/productos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });

    const data = await res.json();
    alert(data.mensaje || 'Producto eliminado');
    cargarProductos();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}

// ----- NUEVO: toggle entre archivo y URL + vista previa -----
document.addEventListener('DOMContentLoaded', () => {
  const rFile = document.querySelector('input[name="modoImagen"][value="file"]');
  const rUrl  = document.querySelector('input[name="modoImagen"][value="url"]');
  const filaFile = document.getElementById('fila-file');
  const filaUrl  = document.getElementById('fila-url');
  const fileInput = document.getElementById('imageFile');
  const urlInput  = document.getElementById('imageUrl');
  const preview   = document.getElementById('preview');

  function syncModo() {
    if (rFile.checked) {
      filaFile.style.display = 'flex';
      filaUrl.style.display  = 'none';
      urlInput.value = '';
    } else {
      filaFile.style.display = 'none';
      filaUrl.style.display  = 'flex';
      fileInput.value = '';
      preview.style.display = 'none';
    }
  }
  rFile.addEventListener('change', syncModo);
  rUrl.addEventListener('change', syncModo);
  syncModo();

  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) { preview.style.display = 'none'; return; }
    const url = URL.createObjectURL(f);
    preview.src = url;
    preview.style.display = 'inline-block';
  });
});

// Maneja el evento de envío del formulario para agregar un nuevo producto
document.getElementById('form-agregar-producto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert("Debes iniciar sesión.");
    return window.location.href = '/html/IniciarSesion.html';
  }

  // ✅ Enviar SIEMPRE como FormData (multipart). El backend usará file o URL.
  const fd = new FormData(e.target);

  // Marcamos qué modo eligió el usuario: 'file' o 'url'
  const modo = document.querySelector('input[name="modoImagen"]:checked')?.value || 'file';
  fd.set('modo', modo);

  try {
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }, // ¡no pongas Content-Type manual!
      body: fd
    });

    const data = await res.json();
    const mensaje = document.getElementById('mensaje-producto');

    if (res.ok) {
      mensaje.textContent = '✅ Producto agregado correctamente.';
      mensaje.style.color = 'green';
      e.target.reset();

      // Restablecer UI imagen
      document.getElementById('preview').style.display = 'none';
      document.querySelector('input[name="modoImagen"][value="file"]').checked = true;
      document.getElementById('fila-file').style.display = 'flex';
      document.getElementById('fila-url').style.display  = 'none';

      cargarProductos();
    } else {
      mensaje.textContent = '❌ ' + (data.mensaje || 'Error al agregar producto');
      mensaje.style.color = 'red';
    }
  } catch (error) {
    console.error('Error al agregar producto:', error);
    document.getElementById('mensaje-producto').textContent = 'Error de conexión con el servidor.';
  }
});

// Ejecuta la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);
