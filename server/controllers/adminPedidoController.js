const pool = require('../config/db');

// GET /api/admin/pedidos
async function listarTodos(req, res) {
    try {
        const result = await pool.query(`
            SELECT p.*, u.nombre AS usuario
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.creado_en DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al listar pedidos:', err);
        res.status(500).json({ mensaje: 'Error al obtener pedidos.' });
    }
}

// PATCH /api/admin/pedidos/:id
async function actualizarEstado(req, res) {
    const pedidoId = req.params.id;
    const { estado } = req.body;

    try {
        const result = await pool.query(
            'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, pedidoId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        }

        res.json({ mensaje: 'Estado actualizado.', pedido: result.rows[0] });
    } catch (err) {
        console.error('Error al actualizar pedido:', err);
        res.status(500).json({ mensaje: 'Error al actualizar el estado del pedido.' });
    }
}

module.exports = {
    listarTodos,
    actualizarEstado
};
