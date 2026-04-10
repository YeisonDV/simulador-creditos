const router = require('express').Router()
const { registro, login } = require('../controllers/auth.controller')
const { verificarToken } = require('../middleware/auth')

router.post('/registro', registro)
router.post('/login',    login)
router.get('/perfil', verificarToken, obtenerPerfil)

module.exports = router