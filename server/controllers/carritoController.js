const {
  obtenerOCrearCarrito,
  agregarAlCarrito,
  obtenerCarritoConDetalle,
  eliminarItem
} = require('../models/carritoModel');

const productoModel = require('../models/productoModel');

/* ================== Helpers de imagen ================== */
function normalizeImageUrl(raw) {
  let url = String(raw || '').trim();

  // Fallback si viene vacío
  if (!url) return '/img/placeholder.png';

  // URL absoluta o data URI -> dejar tal cual
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;

  // Aseguramos que empiece con "/" para que sea ruta web válida
  if (!url.startsWith('/')) url = '/' + url;

  return url;
}

// Intento seguro, soporta varios posibles nombres de función en tu modelo
async function getProductoByIdSafe(id) {
  if (!id) return null;

  const fns = [
    'obtenerPorId',
    'obtenerProductoPorId',
    'getById',
    'getProductById',
    'findById',
    // Si tu modelo expone un "findOne" genérico:
    // Lo envolvemos como función para invocarlo con { id }
    (productoModel.findOne ? async (x) => productoModel.findOne({ id: x }) : null),
  ].filter(Boolean);

  for (const fn of fns) {
    // fn puede ser un string (nombre) o una función ya envuelta
    if (typeof fn === 'string' && typeof productoModel[fn] === 'function') {
      try { return await productoModel[fn](id); } catch (e) {}
    } else if (typeof fn === 'function') {
      try { return await fn(id); } catch (e) {}
    }
  }
  return null;
}

/* ================== Controladores ================== */

// POST /api/carrito/agregar
async function agregar(req, res) {
  const usuario_id = req.usuario.id;
  const { producto_id, cantidad } = req.body;

  try {
    const carrito = await obtenerOCrearCarrito(usuario_id);
    const resultado = await agregarAlCarrito(carrito.id, producto_id, cantidad);
    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al agregar al carrito' });
  }
}

// GET /api/carrito
async function verCarrito(req, res) {
  const usuario_id = req.usuario.id;

  try {
    const carrito = await obtenerOCrearCarrito(usuario_id);
    const contenido = await obtenerCarritoConDetalle(carrito.id); // array de ítems

    const lista = Array.isArray(contenido) ? contenido : [];

    // Para cada item, garantizamos imagen_url usando el producto_id
    const itemsConImagen = await Promise.all(
      lista.map(async (it) => {
        // 1) Si ya viene alguna url de imagen en el item, úsala
        let url = it.imagen_url || it.url_imagen || it.imagen || it.image || it.foto;

        // 2) Si no viene, buscamos el producto por id y tomamos su campo de imagen
        if (!url && it.producto_id) {
          const prod = await getProductoByIdSafe(it.producto_id);
          url =
            prod?.imagen_url ||
            prod?.url_imagen ||
            prod?.imagen ||
            prod?.image ||
            prod?.foto;
        }

        // 3) Normalizamos la url para que siempre sea válida en el navegador
        return {
          ...it,
          imagen_url: normalizeImageUrl(url),
        };
      })
    );

    // Total (por si viene como string, forzamos Number)
    const total = itemsConImagen.reduce(
      (acc, item) => acc + Number(item.subtotal || 0),
      0
    );

    res.json({ carrito: itemsConImagen, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener el carrito' });
  }
}

// DELETE /api/carrito/item/:id
async function eliminar(req, res) {
  try {
    const eliminado = await eliminarItem(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado en carrito' });
    }
    res.json(eliminado);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar del carrito' });
  }
}

module.exports = {
  agregar,
  verCarrito,
  eliminar
};
