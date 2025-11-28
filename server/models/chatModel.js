const pool = require('../config/db');

// Crea un nuevo chat si no existe uno activo con el usuario
async function crearChatSiNoExiste(usuario_id) {
  const result = await pool.query(
    'SELECT * FROM chats WHERE usuario_id = $1 AND estado = $2',
    [usuario_id, 'activo']
  );

  if (result.rows.length > 0) return result.rows[0];

  const nuevo = await pool.query(
    'INSERT INTO chats (usuario_id, estado) VALUES ($1, $2) RETURNING *',
    [usuario_id, 'activo']
  );
  return nuevo.rows[0];
}

// Guarda un mensaje en un chat
async function guardarMensaje(chat_id, emisor, contenido) {
  const result = await pool.query(
    'INSERT INTO mensajes (chat_id, emisor, contenido) VALUES ($1, $2, $3) RETURNING *',
    [chat_id, emisor, contenido]
  );
  return result.rows[0];
}

// Obtiene los mensajes de un chat específico
async function obtenerMensajes(chat_id) {
  const result = await pool.query(
    'SELECT * FROM mensajes WHERE chat_id = $1 ORDER BY enviado_en ASC',
    [chat_id]
  );
  return result.rows;
}

// Finaliza un chat (actualiza el estado)
async function finalizarChat(chat_id) {
  await pool.query('UPDATE chats SET estado = $1 WHERE id = $2', ['finalizado', chat_id]);
  return true;
}

// Devuelve los chats activos para el soporte
async function obtenerChatsActivos() {
  const result = await pool.query(
    `SELECT c.*, u.nombre AS nombre_usuario 
     FROM chats c
     JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.estado = $1
     ORDER BY c.creado_en ASC`,
    ['activo']
  );
  return result.rows;
}

module.exports = {
  crearChatSiNoExiste,
  guardarMensaje,
  obtenerMensajes,
  finalizarChat,
  obtenerChatsActivos,
};
