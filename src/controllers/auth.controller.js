const supabase = require('../config/supabase')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Formato de email inválido' })
}

if (password.length < 6) {
  return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' })
}

const registro = async (req, res) => {
  try {
    const {
      email, password, nombre_completo,
      ingresos_mensuales, deudas_actuales, historial_pago_score
    } = req.body

    if (!email || !password || !nombre_completo) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' })
    }
    if (!ingresos_mensuales || ingresos_mensuales <= 0) {
      return res.status(400).json({ error: 'Los ingresos mensuales deben ser mayores a 0' })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo } }
    })

    if (error) return res.status(400).json({ error: error.message })

    await supabase
      .from('usuarios')
      .upsert({
        id: data.user.id,
        nombre_completo,
        rol_id: 2,
        ingresos_mensuales,
        deudas_actuales: deudas_actuales || 0,
        historial_pago_score: historial_pago_score || 50
      }, { onConflict: 'id' })

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
      user: { id: data.user.id, email: data.user.email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const obtenerPerfil = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(nombre)')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { registro, login, obtenerPerfil}