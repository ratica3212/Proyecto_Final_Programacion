const pool = require('../config/db');

async function guardarMensaje(chatId, emisor, contenido) {
  const result = await pool.query(
    'INSERT INTO mensajes (chat_id, enviado_en, emisor, contenido) VALUES ($1, NOW(), $2, $3) RETURNING *',
    [chatId, emisor, contenido]
  );
  return result.rows[0];
}

async function obtenerMensajes(chatId) {
  const result = await pool.query(
    'SELECT * FROM mensajes WHERE chat_id = $1 ORDER BY enviado_en',
    [chatId]
  );
  return result.rows;
}

module.exports = {
  guardarMensaje,
  obtenerMensajes
};
