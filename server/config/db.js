// Importa el cliente de PostgreSQL
const { Pool } = require('pg');

// Carga variables de entorno desde el archivo .env
require('dotenv').config();

// Crea una instancia de Pool para manejar múltiples conexiones
const pool = new Pool({
  user: process.env.DB_USER,         // Usuario de PostgreSQL
  host: process.env.DB_HOST,         // Host de la base de datos (local o remoto)
  database: process.env.DB_NAME,     // Nombre de la base de datos (debe existir)
  password: process.env.DB_PASSWORD, // Contraseña del usuario de PostgreSQL
  port: process.env.DB_PORT,         // Puerto (por defecto: 5432)
});

// Exporta la instancia para usarla en modelos y consultas
module.exports = pool;
