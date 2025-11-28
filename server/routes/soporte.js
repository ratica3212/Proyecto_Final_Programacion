const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const {
  agregarUsuarioALaCola,
  obtenerPosicion,
  finalizarSiguiente,
  obtenerCola,
  obtenerChatsActivos
} = require('../models/soporteModel');

const {
  verificarToken,
  verificarEmpleado
} = require('../middleware/authMiddleware');

// Ruta para agregar a la cola y verificar o crear chat
router.post('/entrar-en-espera', async (req, res) => {
  const { usuario } = req.body;
  const userId = usuario?.id;

  if (!userId) {
    return res.status(400).json({ mensaje: 'Usuario no válido.' });
  }

  try {
    const posicion = await agregarUsuarioALaCola(userId);

    const resultado = await pool.query(
      'SELECT id FROM chats WHERE usuario_id = $1 AND estado = $2',
      [userId, 'activo']
    );

    let chatId;
    if (resultado.rows.length > 0) {
      chatId = resultado.rows[0].id;
    } else {
      const nuevo = await pool.query(
        'INSERT INTO chats (usuario_id, estado, creado_en) VALUES ($1, $2, NOW()) RETURNING id',
        [userId, 'activo']
      );
      chatId = nuevo.rows[0].id;
    }

    res.json({
      mensaje: 'Has sido agregado a la cola de soporte.',
      posicion,
      chatId
    });
  } catch (error) {
    console.error('Error al crear o consultar el chat:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al crear o consultar el chat.' });
  }
});

// Ruta para finalizar la atención de un usuario
router.post('/finalizar-atencion', verificarToken, verificarEmpleado, async (req, res) => {
  try {
    const siguienteUsuario = await finalizarSiguiente();

    if (siguienteUsuario) {
      res.json({
        mensaje: `Atención finalizada para el usuario ${siguienteUsuario}.`
      });
    } else {
      res.status(400).json({ mensaje: 'No hay usuarios en espera.' });
    }
  } catch (error) {
    console.error('Error al finalizar atención:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al finalizar atención.' });
  }
});

// Consultar chats activos para el panel de soporte
router.get('/chats-activos', verificarToken, async (req, res) => {
  try {
    const chats = await obtenerChatsActivos();
    res.json({ chats });
  } catch (error) {
    console.error('Error al obtener chats activos:', error);
    res.status(500).json({ mensaje: 'Error al obtener chats activos.' });
  }
});

// ✅ Ruta para consultar la cola de soporte
router.get('/cola', async (req, res) => {
  try {
    const cola = await obtenerCola();
    res.json({ cola });
  } catch (error) {
    console.error('Error al obtener la cola:', error);
    res.status(500).json({ mensaje: 'Error al cargar la cola.' });
  }
});



module.exports = router;
