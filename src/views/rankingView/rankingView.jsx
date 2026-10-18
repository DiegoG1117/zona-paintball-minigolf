import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GuestHomeLink from '../../components/GuestHomeLink/GuestHomeLink.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { ProfileAvatar } from '../../avatars/catalog.jsx'
import { MODE_LABELS, MODES } from '../../game/constants.js'
import { formatGameScore } from '../../game/computeLocalResults.js'
import { fetchRankingPage, getCachedRanking, setCachedRanking } from '../../services/rankingService.js'
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
  const initialCache = getCachedRanking(initial)
  const [rows, setRows] = useState(() => initialCache?.rows || [])
  const [cursor, setCursor] = useState(() => initialCache?.cursor || null)
  const [hasMore, setHasMore] = useState(() => Boolean(initialCache?.hasMore))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(() => configured && !initialCache)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef(null)
  const loadingMoreRef = useRef(false)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const remember = useCallback((nextMode, entry) => {
    setCachedRanking(nextMode, entry)
    setRows(entry.rows)
    setCursor(entry.cursor)
    setHasMore(entry.hasMore)
  }, [])

  useEffect(() => {
    const cached = getCachedRanking(mode)
    if (cached) {
      setRows(cached.rows)
      setCursor(cached.cursor)
      setHasMore(cached.hasMore)
      setLoading(false)
      setError('')
      return undefined
    }
    if (!configured) {
      setRows([])
      setCursor(null)
      setHasMore(false)
      setLoading(false)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError('')
    setRows([])
    setCursor(null)
    setHasMore(false)
    fetchRankingPage(mode)
      .then((page) => {
        if (cancelled) return
        remember(mode, {
          rows: page.rows,
          cursor: page.cursor,
          hasMore: Boolean(page.cursor),
        })
      })
      .catch((err) => {
        if (!cancelled) setError(userFacingError(err, 'No se pudo cargar el ranking'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [configured, mode, remember])

  const loadMore = useCallback(async () => {
    if (!configured || !hasMore || !cursor || loadingMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    setError('')
    try {
      const page = await fetchRankingPage(mode, { cursor })
      const nextRows = [...(getCachedRanking(mode)?.rows || rows), ...page.rows]
      const entry = {
        rows: nextRows,
        cursor: page.cursor,
        hasMore: Boolean(page.cursor),
      }
      if (modeRef.current !== mode) {
        setCachedRanking(mode, entry)
        return
      }
      remember(mode, entry)
    } catch (err) {
      setError(userFacingError(err, 'No se pudo cargar más del ranking'))
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [configured, cursor, hasMore, mode, remember, rows])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore || loading) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore()
    }, { rootMargin: '240px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore, loading, rows.length])

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
        {configured ? (
          <div className="rankTableHead">
            <span>Posición</span>
            <span>Nombre</span>
            <span>Usuario</span>
            <span>Puntaje</span>
          </div>
        ) : null}
        {!loading && configured && rows.length === 0 ? <p className="muted">Aún no hay marcas en este modo.</p> : null}
        {rows.map((row, idx) => (
          <div key={row.id} className="rankRow">
            <span className="rankPos">{medals[idx] || `${idx + 1}.`}</span>
            <span className="rankNameCell">
              <ProfileAvatar avatarId={row.avatarId} photoURL={row.photoURL} size={36} className="rankAvatar" />
              <span>{row.displayName || row.username}</span>
            </span>
            <span className="rankUserCell">{row.username}</span>
            <strong className="rankScoreCell">{formatGameScore(mode, row.score)}</strong>
          </div>
        ))}
        {hasMore ? <div ref={sentinelRef} className="rankSentinel" /> : null}
        {loadingMore ? <p className="muted rankMore">Cargando más...</p> : null}
      </div>
      {loading ? <LoadingMask label="Cargando ranking..." /> : null}
    </div>
  )
}

export default RankingView
