const supabase = require('../config/supabase')

// GET /api/admin/reporte — reporte agregado de todas las solicitudes
const reporteSolicitudes = async (req, res) => {
  try {
    const { estado, nivel_riesgo, desde, hasta } = req.query

    let query = supabase
      .from('solicitudes_credito')
      .select(`
        *,
        usuarios (nombre_completo, ingresos_mensuales),
        productos_credito (nombre, tipo),
        analisis_riesgo (cuota_calculada, total_intereses, relacion_deuda_ingreso)
      `)
      .order('created_at', { ascending: false })

    // Filtros opcionales por query params
    if (estado)       query = query.eq('estado', estado)
    if (nivel_riesgo) query = query.eq('nivel_riesgo', nivel_riesgo)
    if (desde)        query = query.gte('created_at', desde)
    if (hasta)        query = query.lte('created_at', hasta)

    const { data, error } = await query
    if (error) throw error

    // Estadísticas agregadas — esto es el "endpoint de reporte" que pide el taller
    const stats = {
      total_solicitudes:         data.length,
      aprobadas:                 data.filter(s => s.estado === 'aprobado').length,
      rechazadas:                data.filter(s => s.estado === 'rechazado').length,
      condicionadas:             data.filter(s => s.estado === 'condicionado').length,
      pendientes:                data.filter(s => s.estado === 'pendiente').length,
      monto_total_solicitado:    data.reduce((acc, s) => acc + Number(s.monto_solicitado), 0),
      score_promedio:            data.length
        ? parseFloat((data.reduce((acc, s) => acc + Number(s.score_riesgo), 0) / data.length).toFixed(1))
        : 0,
      por_nivel_riesgo: {
        bajo:     data.filter(s => s.nivel_riesgo === 'bajo').length,
        medio:    data.filter(s => s.nivel_riesgo === 'medio').length,
        alto:     data.filter(s => s.nivel_riesgo === 'alto').length,
        muy_alto: data.filter(s => s.nivel_riesgo === 'muy_alto').length
      }
    }

    res.json({ stats, solicitudes: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/admin/productos/:id — actualizar producto de crédito
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('productos_credito')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/admin/usuarios/:id/rol — cambiar rol de un usuario
const cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { rol_id } = req.body

    const { data, error } = await supabase
      .from('usuarios')
      .update({ rol_id })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ mensaje: 'Rol actualizado', usuario: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { reporteSolicitudes, actualizarProducto, cambiarRolUsuario }