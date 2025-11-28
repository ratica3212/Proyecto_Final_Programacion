const pool = require('../config/db');

// Crear un nuevo usuario
async function crearUsuario(nombre, correo, contraseña, rol = 'usuario',pais, ciudad,celular) {
    const query = `
        INSERT INTO usuarios (nombre, correo, contraseña, rol, pais, ciudad, celular)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, nombre, correo, rol, pais, ciudad, celular
    `;
    const values = [nombre, correo, contraseña, rol, pais, ciudad, celular];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// Buscar usuario por correo (para login)
async function buscarUsuarioPorCorreo(correo) {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    return result.rows[0];
}

module.exports = {
    crearUsuario,
    buscarUsuarioPorCorreo,
};
