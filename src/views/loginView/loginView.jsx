import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import GuestHomeLink from '../../components/GuestHomeLink/GuestHomeLink.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'

function LoginView() {
  const { login, resetPassword, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(identifier, password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(userFacingError(err, 'No se pudo iniciar sesión'))
    } finally {
      setBusy(false)
    }
  }

  const onReset = async () => {
    setError('')
    setInfo('')
    if (!identifier.trim()) {
      setError('Escribe tu email o username para recuperar la contraseña')
      return
    }
    setBusy(true)
    try {
      await resetPassword(identifier.trim())
      setInfo('Te enviamos un correo para restablecer la contraseña.')
    } catch (err) {
      setError(userFacingError(err, 'No se pudo enviar el correo'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen screen--tabs">
      <GuestHomeLink />
      <h1>Iniciar sesión</h1>
      <form className="screenCard screenCard--tabs" onSubmit={onSubmit}>
        {!configured ? <p className="errorText">Falta configurar Firebase en las variables de entorno.</p> : null}
        <label>
          Email o username
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            placeholder="correo@email.com o diego_golf"
          />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error ? <p className="errorText">{error}</p> : null}
        {info ? <p className="muted">{info}</p> : null}
        <button className="primaryBtn" type="submit" disabled={busy || !configured}>Entrar</button>
        <button className="secondaryBtn" type="button" onClick={onReset} disabled={busy}>Recuperar contraseña</button>
        <p className="muted">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </form>
      {busy ? <LoadingMask label="Conectando..." /> : null}
    </div>
  )
}

export default LoginView
