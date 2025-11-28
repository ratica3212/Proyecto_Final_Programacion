const pool = require('../config/db');

// Asegurar que el usuario tenga un carrito (crear si no existe)
async function obtenerOCrearCarrito(usuario_id) {
    const existente = await pool.query('SELECT * FROM carritos WHERE usuario_id = $1', [usuario_id]);
    if (existente.rows.length > 0) return existente.rows[0];

    const nuevo = await pool.query('INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING *', [usuario_id]);
    return nuevo.rows[0];
}

// Agregar un producto al carrito
async function agregarAlCarrito(carrito_id, producto_id, cantidad) {
    // Ver si ya existe el producto en el carrito
    const existe = await pool.query(
        `SELECT * FROM carrito_items WHERE carrito_id = $1 AND producto_id = $2`,
        [carrito_id, producto_id]
    );

    if (existe.rows.length > 0) {
        // Actualiza cantidad
        const nuevo = await pool.query(
            `UPDATE carrito_items
             SET cantidad = cantidad + $1
             WHERE carrito_id = $2 AND producto_id = $3
             RETURNING *`,
            [cantidad, carrito_id, producto_id]
        );
        return nuevo.rows[0];
    } else {
        // Inserta nuevo
        const nuevo = await pool.query(
            `INSERT INTO carrito_items (carrito_id, producto_id, cantidad)
             VALUES ($1, $2, $3) RETURNING *`,
            [carrito_id, producto_id, cantidad]
        );
        return nuevo.rows[0];
    }
}

// Obtener contenido del carrito
async function obtenerCarritoConDetalle(carrito_id) {
    const result = await pool.query(`
        SELECT ci.id, ci.producto_id, p.nombre, p.precio, ci.cantidad,
               (p.precio * ci.cantidad) AS subtotal
        FROM carrito_items ci
        JOIN productos p ON ci.producto_id = p.id
        WHERE ci.carrito_id = $1
    `, [carrito_id]);
    return result.rows;
}

// Eliminar un ítem del carrito
async function eliminarItem(carrito_item_id) {
    const result = await pool.query(
        'DELETE FROM carrito_items WHERE id = $1 RETURNING *',
        [carrito_item_id]
    );
    return result.rows[0];
}
// Vaciar carrito después de realizar pedido
async function vaciarCarrito(carrito_id) {
    await pool.query('DELETE FROM carrito_items WHERE carrito_id = $1', [carrito_id]);
}


module.exports = {
    obtenerOCrearCarrito,
    agregarAlCarrito,
    obtenerCarritoConDetalle,
    eliminarItem,
    vaciarCarrito // Exporta las funciones para usarlas en otros módulos
};
