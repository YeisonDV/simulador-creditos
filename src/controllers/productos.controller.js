const supabase = require('../config/supabase')

const listarProductos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos_credito')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { listarProductos }