// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
  // Obtiene el token desde localStorage
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al inicio de sesión
  if (!token) return (window.location.href = '/');

  // Selecciona el tbody de la tabla de usuarios
  const tabla = document.querySelector('#tabla-usuarios tbody');

  try {
    // Solicita la lista de usuarios al backend
    const res = await fetch('/api/admin/usuarios', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Convierte la respuesta en JSON
    const usuarios = await res.json();

    // Recorre cada usuario recibido y lo muestra en la tabla
    usuarios.forEach(u => {
      const estadoTexto = u.activo ? 'Activo' : 'Inactivo';

      // Botones de acción según estado del usuario
      const acciones = `
        <button onclick="editarUsuario(${u.id})">Editar</button>
        ${!u.activo ? `<button onclick="eliminarUsuario(${u.id})">Eliminar</button>` : ''}
        <button onclick="cambiarEstadoUsuario(${u.id}, ${u.activo})">
          ${u.activo ? 'Desactivar' : 'Activar'}
        </button>`;

      // Crea una fila y la agrega a la tabla
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.correo}</td>
        <td>${u.rol}</td>
        <td>${estadoTexto}</td>
        <td>${acciones}</td>
      `;
      tabla.appendChild(tr);
    });
  } catch (err) {
    alert('Error al cargar usuarios');
    console.error(err);
  }
});

// Función para abrir el modal de edición con datos del usuario
async function editarUsuario(id) {
  try {
    const res = await fetch(`/api/admin/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    // Rellena el formulario con los datos del usuario
    const usuario = await res.json();
    const form = document.getElementById('form-editar');
    form.id.value = usuario.id;
    form.nombre.value = usuario.nombre;
    form.correo.value = usuario.correo;
    form.rol.value = usuario.rol;

    // Muestra el modal de edición
    document.getElementById('modal-editar').style.display = 'flex';
  } catch (err) {
    alert('Error al obtener datos del usuario');
    console.error(err);
  }
}

// Maneja el envío del formulario de edición
document.getElementById('form-editar').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Obtiene los datos del formulario
  const form = e.target;
  const datos = {
    nombre: form.nombre.value,
    correo: form.correo.value,
    rol: form.rol.value
  };

  try {
    // Envía los datos actualizados al backend
    const res = await fetch(`/api/admin/usuarios/${form.id.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(datos)
    });

    // Muestra el mensaje y recarga la página
    const data = await res.json();
    alert(data.mensaje);
    cerrarModal();
    location.reload();
  } catch (err) {
    alert('Error al actualizar usuario');
    console.error(err);
  }
});

// Elimina un usuario si se confirma la acción
async function eliminarUsuario(id) {
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

  try {
    const res = await fetch(`/api/admin/usuarios/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await res.json();
    alert(data.mensaje);
    location.reload();
  } catch (err) {
    alert('Error al eliminar usuario');
    console.error(err);
  }
}

// Cambia el estado de activo/inactivo de un usuario
async function cambiarEstadoUsuario(id, estadoActual) {
  const accion = estadoActual ? 'desactivar' : 'activar';
  if (!confirm(`¿Seguro que deseas ${accion} este usuario?`)) return;

  try {
    const res = await fetch(`/api/admin/usuarios/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ activo: !estadoActual })
    });

    const data = await res.json();
    alert(data.mensaje);
    location.reload();
  } catch (err) {
    alert(`Error al intentar ${accion} el usuario`);
    console.error(err);
  }
}

// Oculta el modal de edición
function cerrarModal() {
  document.getElementById('modal-editar').style.display = 'none';
}

// Cierra sesión al hacer clic en el botón correspondiente
document.getElementById('logout').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/';
});
