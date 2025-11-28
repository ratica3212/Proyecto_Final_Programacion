const express = require('express');
const router = express.Router();
const { agregar, verCarrito, eliminar } = require('../controllers/carritoController');
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/', verificarToken, verCarrito);
router.post('/agregar', verificarToken, agregar);
router.delete('/item/:id', verificarToken, eliminar);

module.exports = router;
