const express = require('express');
const router = express.Router();
const { agregarCategoria, listarCategorias } = require('../controllers/categoriaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

// Rutas
router.get('/', listarCategorias); // pública
router.post('/', verificarToken, verificarAdmin, agregarCategoria); // solo admin

module.exports = router;
