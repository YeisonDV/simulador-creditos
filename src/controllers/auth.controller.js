const supabase = require('../config/supabase')

const registro = async (req, res) => {
  try {
    const {
      email, password, nombre_completo,
      ingresos_mensuales, deudas_actuales, historial_pago_score
    } = req.body

    // Validaciones básicas
    if (!email || !password || !nombre_completo) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' })
    }
    if (ingresos_mensuales <= 0) {
      return res.status(400).json({ error: 'Los ingresos mensuales deben ser mayores a 0' })
    }

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo } }
    })

    if (error) return res.status(400).json({ error: error.message })

    // Actualizar datos financieros en la tabla usuarios
    // (el trigger de Supabase ya creó la fila, aquí la completamos)
    await supabase
      .from('usuarios')
      .update({ ingresos_mensuales, deudas_actuales: deudas_actuales || 0, historial_pago_score: historial_pago_score || 50 })
      .eq('id', data.user.id)

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      user: { id: data.user.id, email: data.user.email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return res.status(401).json({ error: 'Credenciales incorrectas' })

    res.json({
      token: data.session.access_token,
      user:  { id: data.user.id, email: data.user.email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { registro, login }