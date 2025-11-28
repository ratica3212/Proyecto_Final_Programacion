const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conexión a la base de datos
const pool = require('./config/db');
pool.connect()
  .then(() => console.log('✅ Conexión a PostgreSQL exitosa'))
  .catch(err => console.error('❌ Error de conexión a PostgreSQL', err));

// Middlewares básicos
app.use(cors());
app.use(express.json());

// ✅ Asegurar carpeta de subidas y servirla estáticamente
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// ✅ Servir frontend (client/)
app.use(express.static(path.join(__dirname, '../client')));

// ✅ Ruta raíz para index.html del cliente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/html/index.html'));
});

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/productos', require('./routes/productos')); // <- ya admite archivo/URL
app.use('/api/carrito', require('./routes/carrito'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/admin/pedidos', require('./routes/adminPedidos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/empleado', require('./routes/empleado'));
app.use('/api/soporte', require('./routes/soporte'));
const chatRoutes = require('./routes/chat');
app.use('/api/chats', chatRoutes);

// Lanzar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
