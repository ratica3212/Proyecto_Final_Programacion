const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar token
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = {  // 👈 Aquí usas "usuario"
            id: decoded.id,
            rol: decoded.rol
        };
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
}

// Middleware para verificar si el usuario es administrador
function verificarAdmin(req, res, next) {
    if (req.usuario && req.usuario.rol === 'admin') {  // 👈 Aquí también debe ser "usuario"
        next();
    } else {
        return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol administrador.' });
    }
}

// ✅ Nuevo: Verificar si el usuario es empleado (para soporte)
function verificarEmpleado(req, res, next) {
  const rol = req.usuario?.rol;

  // ✅ Aceptar tanto empleados como soporte
  if (rol === 'empleado' || rol === 'soporte') {
    next();
  } else {
    return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de empleado o soporte.' });
  }
}


module.exports = {
    verificarToken,
    verificarAdmin,
    verificarEmpleado,
};
