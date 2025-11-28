const {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    eliminarProducto
} = require('../models/productoModel');

// GET /api/productos
async function listarProductos(req, res) {
    try {
        const productos = await obtenerProductos();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
}

// POST /api/productos
async function agregarProducto(req, res) {
    try {
        const nuevo = await crearProducto(req.body);
        res.status(201).json(nuevo);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al agregar producto' });
    }
}

// DELETE /api/productos/:id
async function borrarProducto(req, res) {
    try {
        const eliminado = await eliminarProducto(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json(eliminado);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al eliminar producto' });
    }
}

module.exports = {
    listarProductos,
    agregarProducto,
    borrarProducto
};
