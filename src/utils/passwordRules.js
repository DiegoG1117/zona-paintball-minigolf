export function getPasswordIssues(password) {
  const value = String(password || '')
  const issues = []
  if (value.length < 8) issues.push('Usa al menos 8 caracteres')
  if (!/[A-Z]/.test(value)) issues.push('Incluye al menos una mayúscula')
  if (!/\d/.test(value)) issues.push('Incluye al menos un número')
  return issues
}

export function isPasswordValid(password) {
  return getPasswordIssues(password).length === 0
}
