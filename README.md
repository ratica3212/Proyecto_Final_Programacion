# 🛍️ Proyecto Tienda de Ropa – Backend + Frontend  
### Guía de instalación, configuración y solución de errores comunes

Este proyecto contiene un sistema completo de tienda de ropa que incluye:

- Backend en **Node.js + Express + PostgreSQL**
- Frontend en **HTML/CSS/JS**
- Sistema de autenticación con JWT
- Gestión de productos, categorías, usuarios, pedidos y soporte
- Carpeta `/utils` con scripts para crear roles básicos del sistema

Este documento está pensado para facilitar al docente la instalación y ejecución del proyecto, así como la resolución de los problemas más típicos que pueden aparecer al configurar el entorno.

---

## 📁 Estructura General

Proyecto/
│
├── client/ # Archivo web (frontend)
│ ├── html/
│ ├── css/
│ ├── js/
│
└── server/ # API en Node.js + PostgreSQL
├── config/ # Conexión a la BD
├── controllers/
├── models/
├── routes/
├── uploads/ # Carpeta generada automáticamente para imágenes
├── utils/ # Scripts auxiliares (roles, datos iniciales, etc.)
├── .env
└── index.js



---

## ⚙️ 1. Instalación del Backend

Desde la carpeta **server/** ejecutar:

```bash
npm install
Esto descargará todas las dependencias necesarias (Express, PostgreSQL, JWT, etc.).

🔧 2. Configuración del archivo .env
Crear un archivo en server/.env con la siguiente estructura:


# Servidor
PORT=5000

# Base de datos PostgreSQL
DB_USER=postgres
DB_PASSWORD=********       # Contraseña configurada por el docente
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tienda_ropa

# Token JWT
JWT_SECRET=clave_secreta
Nota:
El sistema requiere que JWT_SECRET tenga un valor para poder iniciar sesión.
Si está vacío o mal escrito, el login fallará.

🗄️ 3. Configuración de la Base de Datos
Antes de ejecutar el proyecto, se debe crear la base de datos:


CREATE DATABASE tienda_ropa;
Luego, el proyecto ya maneja la creación de tablas a través de consultas internas.

👤 4. Creación de Roles del Sistema
Dentro de:


server/utils/
hay scripts utilizados para generar los roles necesarios:

Administrador

Empleado

Cliente

Ejemplo de ejecución:


node utils/createRoles.js
(El nombre puede variar según los archivos dentro de la carpeta utils.)

🚀 5. Ejecución del Servidor Backend
Desde la carpeta server:


node index.js
Si se desea recargar automáticamente:


npm install -g nodemon
nodemon index.js
Si todo está correcto, debería mostrarse:


Conexión a PostgreSQL exitosa
Servidor corriendo en http://localhost:5000
🌐 6. Cargar el Frontend
El servidor Express está configurado para servir los archivos del cliente de forma automática.

Abrir en el navegador:

http://localhost:5000
Esto mostrará la interfaz principal del proyecto.

🔧 7. Errores Comunes y Soluciones

1️⃣ Error al conectar a PostgreSQL

SASL: client password must be a string
Causa:
Contraseña vacía o mal definida en .env.

Solución:
Verificar:

DB_PASSWORD=contraseña_correcta

2️⃣ Error al iniciar sesión

secretOrPrivateKey must have a value
Causa:
Variable JWT_SECRET ausente.

Solución:
Agregarla al archivo .env:

JWT_SECRET=clave_secreta

3️⃣ Error al intentar ejecutar el servidor

Error: Cannot find module index.js
Causa:
Nombre del archivo mal ejecutado.

Solución:
Usar:

node index.js
(no index,js)

4️⃣ Error: carpeta de imágenes no encontrada
Si /uploads no existe, el backend la crea automáticamente con:

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

▶️ 8. Pasos Finales para Ejecutar Completo
Crear base de datos

Configurar .env

Instalar dependencias

Ejecutar scripts de /utils si es necesario

Iniciar servidor con node index.js

Abrir navegador en http://localhost:5000
