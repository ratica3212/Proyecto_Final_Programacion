const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Obtener todos los usuarios
router.get('/usuarios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, correo, rol, activo FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario individual por ID
router.get('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
});

// Actualizar usuario
router.put('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, correo = $2, rol = $3 WHERE id = $4 RETURNING *',
      [nombre, correo, rol, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (solo si está inactivo)
router.delete('/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

// Activar o desactivar usuario
router.patch('/usuarios/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  try {
    const result = await pool.query(
      'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING *',
      [activo, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente.` });
  } catch (err) {
    console.error('Error al cambiar estado del usuario:', err);
    res.status(500).json({ mensaje: 'Error al cambiar estado del usuario' });
  }
});

module.exports = router;
