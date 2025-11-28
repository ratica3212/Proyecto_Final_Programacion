const pool = require('../config/db');

// Crear pedido
async function crearPedido(usuario_id, total) {
    const result = await pool.query(
        `INSERT INTO pedidos (usuario_id, total)
         VALUES ($1, $2) RETURNING *`,
        [usuario_id, total]
    );
    return result.rows[0];
}

// Obtener pedidos del usuario
async function obtenerPedidosPorUsuario(usuario_id) {
    const result = await pool.query(
        `SELECT * FROM pedidos
         WHERE usuario_id = $1
         ORDER BY creado_en DESC`,
        [usuario_id]
    );
    return result.rows;
}


// Guardar producto dentro de un pedido (detalle histórico)
async function agregarProductoAlPedido(pedido_id, producto_id, cantidad, precio_unitario) {
    const result = await pool.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [pedido_id, producto_id, cantidad, precio_unitario]
    );
    return result.rows[0];
}


// ✅ Exporta las funciones correctamente
module.exports = {
    crearPedido,
    obtenerPedidosPorUsuario,
    agregarProductoAlPedido
};