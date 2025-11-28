const express = require('express');
const router = express.Router();
const { listarTodos, actualizarEstado } = require('../controllers/adminPedidoController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

// Solo accesible por administradores
router.get('/', verificarToken, verificarAdmin, listarTodos);
router.patch('/:id', verificarToken, verificarAdmin, actualizarEstado);

module.exports = router;
