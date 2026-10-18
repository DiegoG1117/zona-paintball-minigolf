import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { AVATARS, DEFAULT_AVATAR_ID, ProfileAvatar } from '../../avatars/catalog.jsx'
import GuestHomeLink from '../../components/GuestHomeLink/GuestHomeLink.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import DataConsentDialog from '../../components/DataConsentDialog/DataConsentDialog.jsx'
import PasswordField from '../../components/PasswordField/PasswordField.jsx'
import { getPasswordIssues, isPasswordValid } from '../../utils/passwordRules.js'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'
import './registerView.css'

function RegisterView() {
  const { register, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID)
  const [dataConsent, setDataConsent] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const passwordIssues = getPasswordIssues(password)
  const passwordOk = isPasswordValid(password)
  const canSubmit = configured && passwordOk && dataConsent && !busy

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passwordOk) {
      setError(passwordIssues[0] || 'La contraseña no cumple los requisitos')
      return
    }
    if (!dataConsent) {
      setError('Debes autorizar el uso de datos para crear la cuenta')
      return
    }
    setBusy(true)
    try {
      await register({ email, password, username, displayName, avatarId })
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
        <ProfileAvatar avatarId={avatarId} photoURL={avatarId} size={96} className="avatarLg" />
        <h2 className="profileIconHeading">Icono de perfil</h2>
        <div className="avatarChoices">
          {AVATARS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`avatarChoice ${avatarId === item.id ? 'is-selected' : ''}`}
              onClick={() => setAvatarId(item.id)}
              aria-pressed={avatarId === item.id}
              aria-label={item.label}
            >
              <img src={item.src} alt="" width={64} height={64} />
            </button>
          ))}
        </div>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="ejemplo@correo.com"
          />
        </label>
        <label>
          Contraseña
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="**********"
          />
        </label>
        {password ? passwordIssues.map((issue) => (
          <p key={issue} className="errorText">{issue}</p>
        )) : null}
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            placeholder="usuario3214"
          />
        </label>
        <label>
          Nombre visible
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tu primer nombre (Juan)"
          />
        </label>
        <div className="dataConsentRow">
          <label className="dataConsentLabel">
            <input
              type="checkbox"
              checked={dataConsent}
              onChange={(e) => setDataConsent(e.target.checked)}
            />
            <span className="dataConsentInlineText">
              Autorizo el uso de Datos{' '}
              <button
                type="button"
                className="dataConsentMore"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setConsentOpen(true)
                }}
              >
                Ver más
              </button>
            </span>
          </label>
        </div>
        {error ? <p className="errorText">{error}</p> : null}
        <button className="primaryBtn" type="submit" disabled={!canSubmit}>Registrarme</button>
        <p className="muted">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
      <DataConsentDialog open={consentOpen} onClose={() => setConsentOpen(false)} />
      {busy ? <LoadingMask label="Creando cuenta..." /> : null}
    </div>
  )
}

export default RegisterView
