-- Elimina las tablas si ya existen para evitar errores al ejecutar varias veces (modo desarrollo)
DROP TABLE IF EXISTS carrito_items;
DROP TABLE IF EXISTS carritos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS pedido_items;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS cola_soporte;
-- CREATE DATABASE tienda_ropa;
-- Tabla de usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY DEFAULT nextval('usuarios_id_seq'),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    "contraseña" VARCHAR(200) NOT NULL,
    rol VARCHAR(10) DEFAULT 'usuario',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    pais VARCHAR(80) NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    celular VARCHAR(30) NOT NULL UNIQUE
);

-- Tabla de categorías (camisa, pantalón, zapatos, etc.)
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY DEFAULT nextval('categorias_id_seq'),
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de productos
CREATE TABLE productos (
    id INTEGER PRIMARY KEY DEFAULT nextval('productos_id_seq'),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    imagen_url TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    stock INTEGER DEFAULT 0
);

-- Tabla de carritos (uno por usuario activo)
CREATE TABLE carritos (
    id INTEGER PRIMARY KEY DEFAULT nextval('carritos_id_seq'),
    usuario_id INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detalles del carrito (productos añadidos al carrito)
CREATE TABLE carrito_items (
    id INTEGER PRIMARY KEY DEFAULT nextval('carrito_items_id_seq'),
    carrito_id INTEGER REFERENCES carritos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL DEFAULT 1
);

-- Tabla de pedidos (cuando el usuario finaliza compra)
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY DEFAULT nextval('pedidos_id_seq'),
    usuario_id INTEGER REFERENCES usuarios(id),
    total NUMERIC(10,2) NOT NULL,
    estado_pago VARCHAR(20) DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_entrega VARCHAR(30) DEFAULT 'pendiente',
    entregado_por INTEGER REFERENCES usuarios(id),
    actualizado_en TIMESTAMP,
    direccion_entrega TEXT
);

CREATE TABLE pedido_items (
    id INTEGER PRIMARY KEY DEFAULT nextval('pedido_items_id_seq'),
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
);

CREATE TABLE chats (
    id INTEGER PRIMARY KEY DEFAULT nextval('chats_id_seq'),
    usuario_id INTEGER REFERENCES usuarios(id),
    soporte_id INTEGER REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT now()
);

CREATE TABLE mensajes (
    id INTEGER PRIMARY KEY DEFAULT nextval('mensajes_id_seq'),
    chat_id INTEGER REFERENCES chats(id),
    emisor VARCHAR(10),
    contenido TEXT,
    enviado_en TIMESTAMP DEFAULT now(),
    nombre_usuario VARCHAR(100)
);

CREATE TABLE cola_soporte (
    id INTEGER PRIMARY KEY DEFAULT nextval('cola_soporte_id_seq'),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en TIMESTAMP DEFAULT now()
);