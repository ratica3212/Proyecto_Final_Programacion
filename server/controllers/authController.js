const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { crearUsuario, buscarUsuarioPorCorreo } = require('../models/userModel');

// Registro de usuario
async function register(req, res) {
    const { nombre, correo, contraseña, rol, pais, ciudad, celular } = req.body;

    try {
        const usuarioExistente = await buscarUsuarioPorCorreo(correo);
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
        }

        const contraseñaHash = await bcrypt.hash(contraseña, 10);
        const nuevoUsuario = await crearUsuario(nombre, correo, contraseñaHash, rol, pais, ciudad, celular);

        res.status(201).json({ mensaje: 'Usuario creado con éxito.', usuario: nuevoUsuario });
    } catch (err) {
        console.error('Error en register:', err);
        res.status(500).json({ mensaje: 'Error en el servidor.' });
    }
}

// Login de usuario
async function login(req, res) {
    const { correo, contraseña } = req.body;

    try {
        const usuario = await buscarUsuarioPorCorreo(correo);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }
        if (!usuario.activo) {
        return res.status(403).json({ mensaje: 'Usuario desactivado. Contacta al administrador.' });
        }
        const esValido = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esValido) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.json({
            mensaje: 'Login exitoso.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ mensaje: 'Error en el servidor.' });
    }
}

module.exports = { register, login };
