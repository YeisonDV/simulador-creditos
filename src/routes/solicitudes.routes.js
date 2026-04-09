const router = require('express').Router()
const { verificarToken } = require('../middleware/auth')
const { crearSolicitud, obtenerMisSolicitudes, obtenerDetalleSolicitud } = require('../controllers/solicitudes.controller')

// Todas estas rutas requieren estar autenticado
router.use(verificarToken)

router.post('/',    crearSolicitud)
router.get('/',     obtenerMisSolicitudes)
router.get('/:id',  obtenerDetalleSolicitud)

module.exports = router