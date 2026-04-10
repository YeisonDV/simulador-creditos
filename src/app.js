const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth',        require('./routes/auth.routes'))
app.use('/api/productos',   require('./routes/productos.routes'))
app.use('/api/solicitudes', require('./routes/solicitudes.routes'))
app.use('/api/admin',       require('./routes/admin.routes'))

// Ruta de salud — para verificar que el servidor corre
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Simulador de Créditos funcionando ✓', version: '1.0' })
})

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})