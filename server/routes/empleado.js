const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Obtener pedidos pendientes de entrega
router.get('/pedidos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, u.nombre AS cliente, p.creado_en, p.estado_pago, p.estado_entrega, p.direccion_entrega
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.estado_pago = 'pagado' AND p.estado_entrega = 'pendiente'
      ORDER BY p.creado_en DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener pedidos pendientes:', err);
    res.status(500).json({ mensaje: 'Error al obtener pedidos pendientes' });
  }
});

// Confirmar entrega de un pedido y registrar quién lo entregó
router.patch('/pedidos/:id/entregar', verificarToken, async (req, res) => {
  const { id } = req.params;
  const idEmpleado = req.usuario.id;

  try {
    // Obtener fecha actual en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    // Consultar cuántos pedidos ha entregado este empleado hoy
    const conteo = await pool.query(`
      SELECT COUNT(*) FROM pedidos
      WHERE entregado_por = $1
        AND estado_entrega = 'entregado'
        AND DATE(creado_en) = $2
    `, [idEmpleado, hoy]);

    const entregadosHoy = parseInt(conteo.rows[0].count, 10);

    if (entregadosHoy >= 6) {
      return res.status(400).json({
        mensaje: 'Has alcanzado el límite de 6 entregas para hoy.'
      });
    }

    // Marcar el pedido como entregado
    const result = await pool.query(
      'UPDATE pedidos SET estado_entrega = $1, entregado_por = $2 WHERE id = $3 RETURNING *',
      ['entregado', idEmpleado, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido marcado como entregado' });
  } catch (err) {
    console.error('Error al marcar pedido como entregado:', err);
    res.status(500).json({ mensaje: 'Error al marcar pedido como entregado' });
  }
});

// Obtener pedidos entregados por el empleado
router.get('/entregados', verificarToken, async (req, res) => {
  try {
    const idEmpleado = req.usuario.id;

    const result = await pool.query(`
      SELECT p.id, u.nombre AS cliente, p.creado_en, p.total, p.estado_pago, p.estado_entrega
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.entregado_por = $1
      ORDER BY p.creado_en DESC
    `, [idEmpleado]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener pedidos entregados:', err);
    res.status(500).json({ mensaje: 'Error al obtener pedidos entregados' });
  }
});

module.exports = router;
