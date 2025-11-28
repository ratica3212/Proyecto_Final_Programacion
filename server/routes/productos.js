const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const {
  listarProductos,
  agregarProducto,
  borrarProducto
} = require('../controllers/productoController');

const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

// === Multer: configuración de subida ===
const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
  cb(ok ? null : new Error('Formato no permitido'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware para resolver imagen_url según venga archivo o URL
function resolverImagen(req, res, next) {
  try {
    const modo = req.body.modo || (req.file ? 'file' : 'url');
    if (modo === 'file') {
      if (!req.file) return res.status(400).json({ mensaje: 'Falta la imagen' });
      req.body.imagen_url = `/uploads/${req.file.filename}`;
    } else {
      // Acepta imagen_url (principal) o alias comunes del frontend
      req.body.imagen_url =
        req.body.imagen_url || req.body.imageUrl || req.body.urlImagenLegacy || '';
      if (!req.body.imagen_url) return res.status(400).json({ mensaje: 'Falta imagen_url' });
    }
    next();
  } catch (e) {
    next(e);
  }
}

// ----- Rutas -----
// Públicas
router.get('/', listarProductos);

// Protegidas (solo admin). Acepta archivo (imageFile) o URL (imagen_url).
router.post(
  '/',
  verificarToken,
  verificarAdmin,
  upload.single('imageFile'),
  resolverImagen,
  agregarProducto
);

router.delete('/:id', verificarToken, verificarAdmin, borrarProducto);

// Manejo de errores de Multer
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Formato no permitido') {
    return res.status(400).json({ mensaje: err.message });
  }
  next(err);
});

module.exports = router;
