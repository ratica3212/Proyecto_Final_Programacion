const pool = require('../config/db');

async function agregarUsuarioALaCola(userId) {
  await pool.query('INSERT INTO cola_soporte (usuario_id) VALUES ($1)', [userId]);

  const res = await pool.query('SELECT usuario_id FROM cola_soporte ORDER BY creado_en ASC');
  const posicion = res.rows.findIndex(row => row.usuario_id === userId) + 1;

  return posicion;
}

async function obtenerCola() {
  const res = await pool.query('SELECT usuario_id FROM cola_soporte ORDER BY creado_en ASC');
  return res.rows.map(row => row.usuario_id);
}

async function obtenerPosicion(userId) {
  const res = await pool.query('SELECT usuario_id FROM cola_soporte ORDER BY creado_en ASC');
  return res.rows.findIndex(row => row.usuario_id === userId) + 1;
}

async function finalizarSiguiente() {
  const res = await pool.query('SELECT id, usuario_id FROM cola_soporte ORDER BY creado_en ASC LIMIT 1');
  if (res.rows.length === 0) return null;

  const { id, usuario_id } = res.rows[0];
  await pool.query('DELETE FROM cola_soporte WHERE id = $1', [id]);
  return usuario_id;
}

// ✅ NUEVA FUNCIÓN corregida para chats activos
async function obtenerChatsActivos() {
  const result = await pool.query(`
    SELECT c.id, c.usuario_id, u.nombre AS nombre_usuario
    FROM chats c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.estado = 'activo'
    AND EXISTS (
      SELECT 1 FROM mensajes m
      WHERE m.chat_id = c.id AND m.emisor = 'soporte'
    )
    ORDER BY c.creado_en ASC
  `);
  return result.rows;
}

async function eliminarUsuarioDeLaCola(userId) {
  await pool.query('DELETE FROM cola_soporte WHERE usuario_id = $1', [userId]);
}

module.exports = {
  agregarUsuarioALaCola,
  obtenerCola,
  obtenerPosicion,
  finalizarSiguiente,
  obtenerChatsActivos, // exportación incluida
  eliminarUsuarioDeLaCola
};
