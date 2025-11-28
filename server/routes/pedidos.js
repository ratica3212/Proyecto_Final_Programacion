const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/', verificarToken, pedidoController.crear); // Finalizar compra
router.get('/', verificarToken, pedidoController.listar); // Ver mis pedidos
router.patch('/:id/pagar', verificarToken, pedidoController.marcarComoPagado); // Marcar como pagado
router.patch('/:id/entregar', verificarToken, pedidoController.marcarComoEntregado);// Marcar como entregado

module.exports = router;
