// ================================================
// MOTOR DE CÁLCULO FINANCIERO Y SCORING DE RIESGO
// ================================================

/**
 * Calcula la cuota fija mensual usando el sistema francés
 * Fórmula: C = P * [i(1+i)^n] / [(1+i)^n - 1]
 * P = monto, i = tasa mensual, n = plazo en meses
 */
const calcularCuotaMensual = (monto, tasaAnual, plazoMeses) => {
  const tasaMensual = tasaAnual / 100 / 12
  if (tasaMensual === 0) return monto / plazoMeses
  const factor = Math.pow(1 + tasaMensual, plazoMeses)
  const cuota = monto * (tasaMensual * factor) / (factor - 1)
  return Math.round(cuota)
}

/**
 * Genera la tabla de amortización completa mes a mes
 * Cada fila muestra cuánto va a capital, cuánto a interés y el saldo que queda
 */
const generarAmortizacion = (monto, tasaAnual, plazoMeses) => {
  const tasaMensual = tasaAnual / 100 / 12
  const cuota = calcularCuotaMensual(monto, tasaAnual, plazoMeses)
  const tabla = []
  let saldo = monto
  const hoy = new Date()

  for (let i = 1; i <= plazoMeses; i++) {
    const interesMes = Math.round(saldo * tasaMensual)
    const capitalMes = cuota - interesMes
    saldo = Math.max(0, Math.round(saldo - capitalMes))

    // Calcular fecha de vencimiento de cada cuota
    const fechaVenc = new Date(hoy)
    fechaVenc.setMonth(fechaVenc.getMonth() + i)

    tabla.push({
      numero_cuota:     i,
      cuota_total:      cuota,
      capital:          capitalMes,
      interes:          interesMes,
      saldo_restante:   saldo,
      fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
      estado_cuota:     'pendiente'
    })
  }

  return tabla
}

/**
 * Motor de reglas de negocio para scoring de riesgo
 * Evalúa 4 criterios y retorna score 0-100 + decisión
 */
const calcularScoring = (usuario, monto, plazoMeses, tasaAnual) => {
  const cuota = calcularCuotaMensual(monto, tasaAnual, plazoMeses)
  const ingresos = Number(usuario.ingresos_mensuales)
  const deudas   = Number(usuario.deudas_actuales)

  // Máximo que puede destinar a deudas: 30% del ingreso mensual
  const capacidadPago = Math.round(ingresos * 0.30)

  // Qué porcentaje de su ingreso se va en deudas existentes + cuota nueva
  const relacionDeudaIngreso = ((deudas + cuota) / ingresos) * 100

  let score = 100
  const reglas = []

  // --- REGLA 1: ¿La cuota cabe en su capacidad de pago? ---
  if (cuota > capacidadPago) {
    score -= 40
    reglas.push({
      regla: 'cuota_excede_capacidad',
      tipo: 'penalizacion',
      puntos: -40,
      detalle: `Cuota $${cuota.toLocaleString('es-CO')} supera el 30% del ingreso ($${capacidadPago.toLocaleString('es-CO')})`
    })
  } else if (cuota > capacidadPago * 0.8) {
    score -= 15
    reglas.push({
      regla: 'cuota_cercana_limite',
      tipo: 'penalizacion',
      puntos: -15,
      detalle: 'La cuota está entre el 80% y 100% del límite permitido'
    })
  }

  // --- REGLA 2: Nivel de endeudamiento total ---
  if (relacionDeudaIngreso > 50) {
    score -= 30
    reglas.push({
      regla: 'alto_endeudamiento',
      tipo: 'penalizacion',
      puntos: -30,
      detalle: `Relación deuda/ingreso ${relacionDeudaIngreso.toFixed(1)}% supera el límite del 50%`
    })
  } else if (relacionDeudaIngreso > 35) {
    score -= 15
    reglas.push({
      regla: 'endeudamiento_moderado',
      tipo: 'penalizacion',
      puntos: -15,
      detalle: `Relación deuda/ingreso ${relacionDeudaIngreso.toFixed(1)}% está entre 35% y 50%`
    })
  }

  // --- REGLA 3: Historial de pagos ---
  if (usuario.historial_pago_score < 40) {
    score -= 25
    reglas.push({
      regla: 'mal_historial',
      tipo: 'penalizacion',
      puntos: -25,
      detalle: `Historial de pago ${usuario.historial_pago_score}/100 es insuficiente`
    })
  } else if (usuario.historial_pago_score >= 80) {
    score += 10
    reglas.push({
      regla: 'buen_historial',
      tipo: 'bonificacion',
      puntos: +10,
      detalle: `Historial de pago ${usuario.historial_pago_score}/100 excelente`
    })
  }

  // --- REGLA 4: Monto pedido vs ingresos anuales ---
  const ingresosAnuales = ingresos * 12
  if (monto > ingresosAnuales * 3) {
    score -= 20
    reglas.push({
      regla: 'monto_excesivo',
      tipo: 'penalizacion',
      puntos: -20,
      detalle: `Monto solicitado supera 3 veces el ingreso anual ($${ingresosAnuales.toLocaleString('es-CO')})`
    })
  }

  // Mantener score entre 0 y 100
  score = Math.max(0, Math.min(100, score))

  // Decisión final según score
  let nivel, estado, justificacion
  if (score >= 70) {
    nivel  = 'bajo'
    estado = 'aprobado'
    justificacion = `Perfil financiero sólido. Score ${score}/100. El solicitante cumple todos los criterios de riesgo.`
  } else if (score >= 50) {
    nivel  = 'medio'
    estado = 'condicionado'
    justificacion = `Perfil aceptable con observaciones. Score ${score}/100. Aprobado con condiciones: ${reglas.filter(r => r.tipo === 'penalizacion').map(r => r.detalle).join('. ')}`
  } else if (score >= 30) {
    nivel  = 'alto'
    estado = 'condicionado'
    justificacion = `Riesgo elevado. Score ${score}/100. Se recomienda reducir monto o plazo. ${reglas.filter(r => r.tipo === 'penalizacion').map(r => r.detalle).join('. ')}`
  } else {
    nivel  = 'muy_alto'
    estado = 'rechazado'
    justificacion = `Solicitud rechazada. Score ${score}/100. No cumple criterios mínimos. ${reglas.map(r => r.detalle).join('. ')}`
  }

  return {
    score,
    nivel,
    estado,
    justificacion,
    reglas,
    capacidadPago,
    relacionDeudaIngreso: parseFloat(relacionDeudaIngreso.toFixed(2)),
    cuotaCalculada:       cuota,
    totalAPagar:          cuota * plazoMeses,
    totalIntereses:       (cuota * plazoMeses) - monto,
    tasaMensual:          parseFloat((tasaAnual / 100 / 12).toFixed(6))
  }
}

/**
 * Genera escenarios comparativos bajo distintas tasas y plazos
 * Para que el usuario vea cómo cambia su cuota con otras condiciones
 */
const generarEscenarios = (monto, tasaBase, plazoBase) => {
  const tasas  = [tasaBase - 4, tasaBase, tasaBase + 4].filter(t => t > 0)
  const plazos = [
    Math.max(6, plazoBase - 12),
    plazoBase,
    plazoBase + 12
  ]

  const escenarios = []

  for (const tasa of tasas) {
    for (const plazo of plazos) {
      const cuota = calcularCuotaMensual(monto, tasa, plazo)
      const total = cuota * plazo
      escenarios.push({
        tasa_usada:       tasa,
        plazo_usado:      plazo,
        cuota_resultante: cuota,
        total_intereses:  Math.round(total - monto),
        total_pagar:      Math.round(total),
        etiqueta:         `Tasa ${tasa}% · ${plazo} meses`
      })
    }
  }

  return escenarios
}

module.exports = {
  calcularCuotaMensual,
  generarAmortizacion,
  calcularScoring,
  generarEscenarios
}