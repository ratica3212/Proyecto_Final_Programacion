const { crearCategoria, obtenerCategorias } = require('../models/categoriaModel');

// POST /api/categorias
async function agregarCategoria(req, res) {
    const { nombre } = req.body;
    try {
        const nueva = await crearCategoria(nombre);
        res.status(201).json(nueva);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al agregar categoría' });
    }
}

// GET /api/categorias
async function listarCategorias(req, res) {
    try {
        const categorias = await obtenerCategorias();
        res.json(categorias);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener categorías' });
    }
}

module.exports = { agregarCategoria, listarCategorias };
