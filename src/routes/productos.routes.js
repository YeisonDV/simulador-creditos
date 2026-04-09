const router = require('express').Router()
const { listarProductos } = require('../controllers/productos.controller')

// Ruta pública — no necesita token
router.get('/', listarProductos)

module.exports = router