import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GuestHomeLink from '../../components/GuestHomeLink/GuestHomeLink.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { ProfileAvatar } from '../../avatars/catalog.jsx'
import { MODE_LABELS, MODES } from '../../game/constants.js'
import { formatGameScore } from '../../game/computeLocalResults.js'
import { fetchAllRankings, getCachedRankings } from '../../services/rankingService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'

const TABS = [MODES.classic, MODES.runner, MODES.miniuno]
const medals = ['🥇', '🥈', '🥉']

function RankingView() {
  const location = useLocation()
  const { configured, user } = useAuth()
  const initial = location.state?.mode && TABS.includes(location.state.mode)
    ? location.state.mode
    : MODES.classic
  const [mode, setMode] = useState(initial)
  const [rankingsByMode, setRankingsByMode] = useState(() => getCachedRankings() || {})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(() => !getCachedRankings())

  useEffect(() => {
    if (!configured) return undefined
    let cancelled = false
    const hasCache = Boolean(getCachedRankings())
    if (!hasCache) setLoading(true)
    setError('')
    fetchAllRankings()
      .then((data) => {
        if (!cancelled) setRankingsByMode(data)
      })
      .catch((err) => {
        if (!cancelled) setError(userFacingError(err, 'No se pudo cargar el ranking'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [configured])

  const rows = rankingsByMode[mode] || []

  return (
    <div className="screen screen--tabs">
      {!user ? <GuestHomeLink /> : null}
      <h1>Ranking</h1>
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className="secondaryBtn"
            aria-selected={mode === tab}
            onClick={() => setMode(tab)}
          >
            {MODE_LABELS[tab]}
          </button>
        ))}
      </div>
      <div className="screenCard screenCard--tabs">
        {!configured ? <p>Configura Firebase para ver el ranking global.</p> : null}
        {error ? <p className="errorText">{error}</p> : null}
        {!loading && configured && rows.length === 0 ? <p className="muted">Aún no hay marcas en este modo.</p> : null}
        {rows.map((row, idx) => (
          <div key={row.id} className="rankRow">
            <span>{medals[idx] || `${idx + 1}.`}</span>
            <ProfileAvatar avatarId={row.avatarId} photoURL={row.photoURL} size={36} className="rankAvatar" />
            <span>{row.displayName || row.username}</span>
            <strong>{formatGameScore(mode, row.score)}</strong>
          </div>
        ))}
      </div>
      {loading ? <LoadingMask label="Cargando ranking..." /> : null}
    </div>
  )
}

export default RankingView
