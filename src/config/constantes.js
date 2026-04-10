module.exports = {
  ROLES: {
    ADMIN:   1,
    USUARIO: 2
  },
  ESTADOS_SOLICITUD: {
    PENDIENTE:    'pendiente',
    APROBADO:     'aprobado',
    RECHAZADO:    'rechazado',
    CONDICIONADO: 'condicionado'
  },
  NIVELES_RIESGO: {
    BAJO:     'bajo',
    MEDIO:    'medio',
    ALTO:     'alto',
    MUY_ALTO: 'muy_alto'
  },
  SCORING: {
    UMBRAL_APROBADO:     70,
    UMBRAL_CONDICIONADO: 50,
    UMBRAL_ALTO:         30
  }
}