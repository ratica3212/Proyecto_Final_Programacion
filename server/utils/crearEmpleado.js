require('dotenv').config({ path: __dirname + '/../.env' });

// server/utils/crearSoporte.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function crearUsuarioEmpleado() {
  const nombre = 'aleja';
  const correo = 'aleja@tienda.com';
  const contraseñaPlana = '1234';
  const rol = 'empleado';
  const pais = 'Colombia';
  const ciudad = 'Medellín';
  const celular = '3001234590';

  try {
    const hash = await bcrypt.hash(contraseñaPlana, 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, rol, pais, ciudad, celular) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [nombre, correo, hash, rol, pais, ciudad, celular]
    );

    console.log('✅ Usuario de Empleado creado con éxito.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear usuario:', err);
    process.exit(1);
  }
}

crearUsuarioEmpleado();
