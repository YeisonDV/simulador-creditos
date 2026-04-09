const supabase = require('../config/supabase')

// Verifica que el usuario tenga un token válido
const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  // Obtener perfil completo con rol
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*, roles(nombre)')
    .eq('id', user.id)
    .single()

  req.user = { ...user, perfil }
  next()
}

// Solo deja pasar a administradores
const soloAdmin = (req, res, next) => {
  if (req.user?.perfil?.roles?.nombre !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

module.exports = { verificarToken, soloAdmin }