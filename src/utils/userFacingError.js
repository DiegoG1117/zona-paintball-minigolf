const AUTH_MESSAGES = {
  'auth/invalid-credential': 'Email o contraseña incorrectos',
  'auth/invalid-email': 'El email no es válido',
  'auth/user-not-found': 'Email o contraseña incorrectos',
  'auth/wrong-password': 'Email o contraseña incorrectos',
  'auth/email-already-in-use': 'Ese email ya tiene una cuenta',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red e inténtalo otra vez',
  'auth/user-disabled': 'Esta cuenta está deshabilitada',
  'auth/missing-password': 'Escribe tu contraseña',
  'auth/invalid-login-credentials': 'Email o contraseña incorrectos',
}

const FIRESTORE_MESSAGES = {
  'permission-denied': 'No tienes permiso para hacer esto',
  unavailable: 'El servidor no responde. Inténtalo de nuevo',
  'not-found': 'No encontramos esa información',
  cancelled: 'La operación se canceló',
  'deadline-exceeded': 'La petición tardó demasiado. Inténtalo de nuevo',
}

const OWN_MESSAGES = new Set([
  'Ese username ya está en uso',
  'El username debe tener 3-20 caracteres (letras, números o _)',
  'Código inválido o partida cerrada',
  'La partida ya no existe',
  'Esta partida ya no admite jugadores',
  'Firebase no está configurado',
  'Inicia sesión primero',
  'Inicia sesión para crear una partida',
  'Inicia sesión para unirte',
  'No hay partida activa',
  'Solo el anfitrión puede finalizar',
  'No se pudo generar un código. Inténtalo de nuevo.',
  'Perfil no encontrado',
  'Entra una vez con tu correo para activar el acceso por username',
  'No encontramos ese username',
  'Escribe tu email o username',
])

function readCode(err) {
  if (!err) return ''
  if (typeof err.code === 'string') return err.code.replace(/^firestore\//, '')
  const fromMessage = String(err.message || '').match(/auth\/[a-z0-9-]+/i)
  return fromMessage ? fromMessage[0].toLowerCase() : ''
}

export function userFacingError(err, fallback = 'Algo salió mal. Inténtalo de nuevo') {
  if (!err) return fallback
  const message = String(err.message || '').trim()
  if (OWN_MESSAGES.has(message)) return message
  const code = readCode(err)
  if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]
  if (FIRESTORE_MESSAGES[code]) return FIRESTORE_MESSAGES[code]
  if (message && !message.startsWith('Firebase:') && !message.startsWith('Firestore:')) {
    return message
  }
  return fallback
}
