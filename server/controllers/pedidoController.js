const pool = require('../config/db');
const {
  crearPedido,
  obtenerPedidosPorUsuario,
  agregarProductoAlPedido
} = require('../models/pedidoModel');
const {
  obtenerOCrearCarrito,
  obtenerCarritoConDetalle,
  vaciarCarrito
} = require('../models/carritoModel');


// POST /api/pedidos
async function crear(req, res) {
  const usuario_id = req.usuario.id;
  const { direccion } = req.body;

  if (!direccion || direccion.trim() === "") {
    return res.status(400).json({ mensaje: 'La dirección de entrega es obligatoria.' });
  }

  try {
    const carrito = await obtenerOCrearCarrito(usuario_id);
    const items = await obtenerCarritoConDetalle(carrito.id);

    if (items.length === 0) {
      return res.status(400).json({ mensaje: 'Tu carrito está vacío.' });
    }

    // Validar stock disponible antes de proceder
    for (const item of items) {
      const result = await pool.query(
        'SELECT stock FROM productos WHERE id = $1',
        [item.producto_id]
      );
      const stockActual = result.rows[0]?.stock || 0;

      if (stockActual < item.cantidad) {
        await vaciarCarrito(carrito.id);
        return res.status(400).json({
          mensaje: `No hay suficiente stock para el producto "${item.nombre}". Se ha vaciado tu carrito.`
        });
      }
    }

    const total = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

    // Crear pedido con dirección
    const result = await pool.query(
      `INSERT INTO pedidos 
       (usuario_id, total, direccion_entrega, estado_pago, estado_entrega, creado_en)
       VALUES ($1, $2, $3, 'pendiente', 'pendiente', NOW())
       RETURNING id, usuario_id, total, direccion_entrega, estado_pago, estado_entrega, creado_en`,
      [usuario_id, total, direccion]
    );
    const pedido = result.rows[0];

    // Descontar stock
    for (const item of items) {
      await pool.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.cantidad, item.producto_id]
      );
    }

    // Guardar detalle del pedido
    for (const item of items) {
      await agregarProductoAlPedido(
        pedido.id,
        item.producto_id,
        item.cantidad,
        item.precio
      );
    }

    // Vaciar carrito (pedido exitoso)
    await vaciarCarrito(carrito.id);
    console.log('✅ Pedido creado y carrito vaciado');

    res.status(201).json({
      mensaje: 'Pedido creado con éxito.',
      pedido,
      total
    });
  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ mensaje: 'Error al registrar el pedido.' });
  }
}


// PATCH /api/pedidos/:id/pagar
async function marcarComoPagado(req, res) {
  const pedido_id = req.params.id;

  try {
    await pool.query(
      `UPDATE pedidos 
       SET estado_pago = 'pagado', estado_entrega = 'pendiente' 
       WHERE id = $1`,
      [pedido_id]
    );

    res.status(200).json({ mensaje: 'Pedido marcado como pagado y pendiente de entrega.' });
  } catch (err) {
    console.error('Error al actualizar el estado del pedido:', err);
    res.status(500).json({ mensaje: 'Error al actualizar el estado del pedido.' });
  }
}

async function marcarComoEntregado(req, res) {
  const pedido_id = req.params.id;
  const rol = req.usuario.rol;

  if (rol !== 'empleado') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Solo empleados pueden marcar como entregado.' });
  }

  try {
    await pool.query(
      'UPDATE pedidos SET estado_entrega = $1 WHERE id = $2',
      ['entregado', pedido_id]
    );
    res.status(200).json({ mensaje: 'Pedido marcado como entregado.' });
  } catch (err) {
    console.error('Error al actualizar estado de entrega:', err);
    res.status(500).json({ mensaje: 'Error al marcar como entregado.' });
  }
}

// GET /api/pedidos
async function listar(req, res) {
  const usuario_id = req.usuario.id;

  try {
    const pedidos = await obtenerPedidosPorUsuario(usuario_id);
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos.' });
  }
}

module.exports = {
  crear,
  listar,
  marcarComoPagado,
  marcarComoEntregado
};
