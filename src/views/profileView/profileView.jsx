import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { AVATARS, ProfileAvatar, resolveAvatarId } from '../../avatars/catalog.jsx'
import { BEST_FIELDS, MODE_LABELS, MODES } from '../../game/constants.js'
import { formatGameScore } from '../../game/computeLocalResults.js'
import { countBetterScores } from '../../services/usersService.js'
import { listUserGames } from '../../services/gamesService.js'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'
import './profileView.css'

const playedDateFormat = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatPlayedOn(value) {
  let date = null
  if (value && typeof value.toDate === 'function') date = value.toDate()
  else if (value && typeof value.seconds === 'number') date = new Date(value.seconds * 1000)
  if (!date || Number.isNaN(date.getTime())) return ''
  return playedDateFormat.format(date)
}

function ProfileView() {
  const { profile, user, updateProfile, refreshProfile, logout } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [avatarId, setAvatarId] = useState(() => resolveAvatarId(profile))
  const [editing, setEditing] = useState(false)
  const [ranks, setRanks] = useState({})
  const [games, setGames] = useState([])
  const [cursor, setCursor] = useState(null)
  const [historyError, setHistoryError] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (editing) return
    setDisplayName(profile?.displayName || '')
    setUsername(profile?.username || '')
    setAvatarId(resolveAvatarId(profile))
  }, [profile, editing])

  useEffect(() => {
    if (!user?.uid) return undefined
    let cancelled = false
    const modes = Object.values(MODES)
    Promise.all(modes.map((mode) => {
      const score = profile?.[BEST_FIELDS[mode]]
      if (score == null) return Promise.resolve([mode, null])
      return countBetterScores(mode, score).then((rank) => [mode, rank]).catch(() => [mode, null])
    })).then((entries) => {
      if (!cancelled) setRanks(Object.fromEntries(entries))
    })
    listUserGames(user.uid).then((page) => {
      if (!cancelled) {
        setGames(page.games)
        setCursor(page.cursor)
        setHistoryError('')
      }
    }).catch((err) => {
      if (!cancelled) setHistoryError(userFacingError(err, 'No se pudo cargar el historial'))
    })
    return () => { cancelled = true }
  }, [user?.uid, profile])

  const startEditing = () => {
    setError('')
    setInfo('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setDisplayName(profile?.displayName || '')
    setUsername(profile?.username || '')
    setAvatarId(resolveAvatarId(profile))
    setError('')
    setInfo('')
    setEditing(false)
  }

  const onToggleEdit = () => {
    if (editing) cancelEditing()
    else startEditing()
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await updateProfile({ displayName, username, avatarId, photoURL: avatarId })
      setInfo('Perfil actualizado')
      await refreshProfile()
      setEditing(false)
    } catch (err) {
      setError(userFacingError(err, 'No se pudo guardar'))
    } finally {
      setBusy(false)
    }
  }

  const loadMore = async () => {
    if (cursor == null || !user?.uid) return
    try {
      const page = await listUserGames(user.uid, { cursor })
      setGames((prev) => [...prev, ...page.games])
      setCursor(page.cursor)
      setHistoryError('')
    } catch (err) {
      setHistoryError(userFacingError(err, 'No se pudo cargar el historial'))
    }
  }

  return (
    <div className="screen screen--tabs">
      <h1>Mi perfil</h1>
      <div className="screenCard screenCard--tabs">
        <ProfileAvatar avatarId={avatarId} photoURL={avatarId} size={96} className="avatarLg" />
        <h2 className="profileIconHeading">Icono de perfil</h2>
        <div className={`avatarChoices${editing ? '' : ' profileAvatarChoicesDisabled'}`}>
          {AVATARS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`avatarChoice ${avatarId === item.id ? 'is-selected' : ''}`}
              onClick={() => setAvatarId(item.id)}
              disabled={!editing}
              aria-pressed={avatarId === item.id}
              aria-label={item.label}
            >
              <img src={item.src} alt="" width={64} height={64} />
            </button>
          ))}
        </div>

        <form onSubmit={onSave}>
          <div className="profileEditBar">
            <button
              type="button"
              className={`profileEditBtn${editing ? ' is-cancel' : ''}`}
              onClick={onToggleEdit}
              disabled={busy}
              aria-label={editing ? 'Cancelar edición' : 'Editar perfil'}
            >
              {editing ? (
                <svg className="profileEditIcon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="profileEditIcon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.25H5v-.92l9.06-9.06.92.92L5.92 19.5zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              )}
            </button>
          </div>

          <div className="profileFieldBlock">
            <label>
              Nombre
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!editing}
              />
            </label>
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!editing}
              />
            </label>
          </div>

          {error ? <p className="errorText">{error}</p> : null}
          {info ? <p className="muted">{info}</p> : null}
          {editing ? (
            <button className="primaryBtn profileBtnFull" type="submit" disabled={busy}>
              Guardar
            </button>
          ) : null}
        </form>
        <button className="profileLogoutBtn" type="button" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </div>

      <div className="screenCard screenCard--tabs">
        {Object.values(MODES).map((mode) => (
          <div key={mode} className="listRow">
            <span>{MODE_LABELS[mode]}</span>
            <span>
              {ranks[mode] ? `Puesto #${ranks[mode]} · ` : ''}
              Mejor: {formatGameScore(mode, profile?.[BEST_FIELDS[mode]])}
            </span>
          </div>
        ))}
        <p className="muted">
          Partidas: {(profile?.totalGamesClassic || 0) + (profile?.totalGamesRunner || 0) + (profile?.totalGamesMiniuno || 0)}
        </p>
      </div>

      <div className="screenCard screenCard--tabs">
        <h2>Historial</h2>
        {games.map((g) => {
          const playedOn = formatPlayedOn(g.createdAt)
          return (
            <div key={g.id} className="listRow">
              <span className="historyGame">
                <span>{MODE_LABELS[g.mode] || g.mode}</span>
                {playedOn ? <span className="historyDate">{playedOn}</span> : null}
              </span>
              <span>{formatGameScore(g.mode, g.score)}</span>
            </div>
          )
        })}
        {historyError ? <p className="errorText">{historyError}</p> : null}
        {!historyError && games.length === 0 ? <p className="muted">Aún no hay partidas guardadas.</p> : null}
        {cursor ? <button className="secondaryBtn" type="button" onClick={loadMore}>Cargar más</button> : null}
      </div>
      {busy ? <LoadingMask label="Guardando perfil..." /> : null}
    </div>
  )
}

export default ProfileView
