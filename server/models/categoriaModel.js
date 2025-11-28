const pool = require('../config/db');

// Agregar una nueva categoría
async function crearCategoria(nombre) {
    const result = await pool.query(
        'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
        [nombre]
    );
    return result.rows[0];
}

// Obtener todas las categorías
async function obtenerCategorias() {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    return result.rows;
}

module.exports = { crearCategoria, obtenerCategorias };
