const router = require('express').Router()
const { verificarToken } = require('../middleware/auth')
const { registro, login, obtenerPerfil, actualizarPerfil } = require('../controllers/auth.controller')

router.post('/registro', registro)
router.post('/login',    login)
router.get('/perfil',    verificarToken, obtenerPerfil)
router.patch('/perfil',  verificarToken, actualizarPerfil)

module.exports = router