const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarEmpleado } = require('../middleware/authMiddleware');
const { eliminarUsuarioDeLaCola } = require('../models/soporteModel');

const {
  crearChatSiNoExiste,
  guardarMensaje,
  obtenerMensajes,
  finalizarChat,
  obtenerChatsActivos
} = require('../models/chatModel');

// Obtener todos los chats activos
router.get('/activos', async (req, res) => {
  try {
    const chats = await obtenerChatsActivos();
    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener los chats activos.' });
  }
});

// Crear un chat si no existe
router.post('/crear', async (req, res) => {
  const { usuario_id } = req.body;
  try {
    const chat = await crearChatSiNoExiste(usuario_id);
    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear chat.' });
  }
});

// Guardar mensaje con nombre_usuario
router.post('/:chatId/mensajes', verificarToken, async (req, res) => {
  const chatId = req.params.chatId;
  const { contenido, remitente } = req.body;

  try {
    let nombre_usuario = 'Soporte';
    if (remitente === 'usuario') {
      const result = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [req.usuario.id]);
      nombre_usuario = result.rows[0]?.nombre || 'Usuario';
    }

    await pool.query(
      `INSERT INTO mensajes (chat_id, emisor, contenido, nombre_usuario, enviado_en)
       VALUES ($1, $2, $3, $4, NOW())`,
      [chatId, remitente, contenido, nombre_usuario]
    );

    res.json({ mensaje: 'Mensaje guardado exitosamente.' });
  } catch (err) {
    console.error('❌ Error al guardar mensaje:', err);
    res.status(500).json({ mensaje: 'Error al enviar mensaje.' });
  }
});

// Obtener mensajes del chat
router.get('/:chatId/mensajes', verificarToken, async (req, res) => {
  const { chatId } = req.params;

  try {
    const mensajes = await pool.query(
      'SELECT contenido, nombre_usuario, emisor FROM mensajes WHERE chat_id = $1 ORDER BY enviado_en ASC',
      [chatId]
    );

    const usuarioRes = await pool.query(`
      SELECT u.nombre
      FROM chats c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = $1
    `, [chatId]);

    const nombreUsuario = usuarioRes.rows[0]?.nombre || 'Usuario';

    res.json({
      mensajes: mensajes.rows,
      nombreUsuario
    });
  } catch (err) {
    console.error('❌ Error al obtener mensajes:', err);
    res.status(500).json({ mensaje: 'Error al obtener mensajes.' });
  }
});

// Finalizar chat y asignar soporte_id
router.post('/finalizar', verificarToken, verificarEmpleado, async (req, res) => {
  const { chat_id } = req.body;
  const soporteId = req.usuario.id;

  try {
    await pool.query(
      'UPDATE chats SET estado = $1, soporte_id = $2 WHERE id = $3',
      ['finalizado', soporteId, chat_id]
    );

    await pool.query(
      'DELETE FROM cola_soporte WHERE usuario_id = (SELECT usuario_id FROM chats WHERE id = $1)',
      [chat_id]
    );

    res.json({ mensaje: 'Chat finalizado exitosamente.' });
  } catch (err) {
    console.error('❌ Error al finalizar chat:', err);
    res.status(500).json({ mensaje: 'Error al finalizar chat.' });
  }
});

// Obtener chat activo por usuario
router.get('/por-usuario/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT * FROM chats WHERE usuario_id = $1 AND estado = $2 LIMIT 1',
      [usuarioId, 'activo']
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No hay chat activo para este usuario.' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al buscar chat por usuario:', error);
    res.status(500).json({ mensaje: 'Error al buscar el chat del usuario.' });
  }
});

// ✅ Ruta final para obtener chats finalizados por soporte actual
router.get('/finalizados', verificarToken, verificarEmpleado, async (req, res) => {
  const soporteId = req.usuario.id;

  try {
    const resultado = await pool.query(
      `SELECT c.id, c.usuario_id, u.nombre AS nombre_usuario, c.creado_en
       FROM chats c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.estado = 'finalizado' AND c.soporte_id = $1
       ORDER BY c.creado_en DESC`,
      [soporteId]
    );

    res.json({ chats: resultado.rows });
  } catch (err) {
    console.error('❌ Error al obtener chats finalizados:', err);
    res.status(500).json({ mensaje: 'Error al obtener chats finalizados.' });
  }
});


module.exports = router;
