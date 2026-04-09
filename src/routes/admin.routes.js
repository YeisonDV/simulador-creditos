const router = require('express').Router()
const { verificarToken, soloAdmin } = require('../middleware/auth')
const { reporteSolicitudes, actualizarProducto, cambiarRolUsuario } = require('../controllers/admin.controller')

// Todas estas rutas requieren token + ser admin
router.use(verificarToken, soloAdmin)

router.get('/reporte',              reporteSolicitudes)
router.patch('/productos/:id',      actualizarProducto)
router.patch('/usuarios/:id/rol',   cambiarRolUsuario)

module.exports = router