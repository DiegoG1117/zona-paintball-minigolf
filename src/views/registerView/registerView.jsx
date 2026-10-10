import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import GuestHomeLink from '../../components/GuestHomeLink/GuestHomeLink.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { getPasswordIssues, isPasswordValid } from '../../utils/passwordRules.js'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'

function RegisterView() {
  const { register, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const passwordIssues = getPasswordIssues(password)
  const passwordOk = isPasswordValid(password)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passwordOk) {
      setError(passwordIssues[0] || 'La contraseña no cumple los requisitos')
      return
    }
    setBusy(true)
    try {
      await register({ email, password, username, displayName })
      navigate('/', { replace: true })
    } catch (err) {
      setError(userFacingError(err, 'No se pudo crear la cuenta'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen screen--tabs">
      <GuestHomeLink />
      <h1>Crear cuenta</h1>
      <form className="screenCard screenCard--tabs" onSubmit={onSubmit}>
        {!configured ? <p className="errorText">Falta configurar Firebase en las variables de entorno.</p> : null}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </label>
        {password ? passwordIssues.map((issue) => (
          <p key={issue} className="errorText">{issue}</p>
        )) : null}
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} placeholder="diego_golf" />
        </label>
        <label>
          Nombre visible
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Diego" />
        </label>
        {error ? <p className="errorText">{error}</p> : null}
        <button className="primaryBtn" type="submit" disabled={busy || !configured || !passwordOk}>Registrarme</button>
        <p className="muted">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
      {busy ? <LoadingMask label="Creando cuenta..." /> : null}
    </div>
  )
}

export default RegisterView
