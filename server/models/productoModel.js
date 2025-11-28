const pool = require('../config/db');

// Crear producto nuevo
async function crearProducto({ nombre, descripcion, precio, imagen_url, categoria_id, stock }) {
  const result = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria_id, stock)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nombre, descripcion, precio, imagen_url, categoria_id, stock]
  );
  return result.rows[0];
}

// Obtener todos los productos
async function obtenerProductos() {
  const result = await pool.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.nombre
  `);
  return result.rows;
}

// Obtener un producto por ID
async function obtenerProductoPorId(id) {
  const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
  return result.rows[0];
}

// Eliminar producto
async function eliminarProducto(id) {
  const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  eliminarProducto,
};
