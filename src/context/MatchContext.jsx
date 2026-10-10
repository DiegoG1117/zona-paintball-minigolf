/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { computeTotalFromHoles, formatGameScore } from '../game/computeLocalResults.js'
import { clearGameStorage } from '../game/clearGameStorage.js'
import { MODE_ROUTES, SCORE_POLL_MS, SCORE_WRITE_DEBOUNCE_MS } from '../game/constants.js'
import { saveMyFinishedGame } from '../services/gamesService.js'
import { userFacingError } from '../utils/userFacingError.js'
import {
  abandonMatchInFirestore,
  createMatch as createMatchDoc,
  finishMatchInFirestore,
  getMatch,
  getMatchPlayers,
  getMatchScores,
  joinMatch as joinMatchDoc,
  listenMatch,
  listenMatchPlayers,
  persistActiveMatchId,
  readActiveMatchId,
  startMatch as startMatchDoc,
  writePlayerScore,
} from '../services/matchesService.js'

const MatchContext = createContext(null)

function toTable(players, scores) {
  return [...players]
    .map((p) => ({
      id: p.id,
      name: p.displayName || p.username || 'Jugador',
      photoURL: p.photoURL || '',
      avatarId: p.avatarId || '',
      score: Number(scores[p.id]?.total ?? computeTotalFromHoles(scores[p.id]?.holes || {})),
    }))
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
}

export function MatchProvider({ children }) {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [match, setMatch] = useState(null)
  const [players, setPlayers] = useState([])
  const [scores, setScores] = useState({})
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveError, setSaveError] = useState('')
  const [personalRecord, setPersonalRecord] = useState(false)
  const [sessionKind, setSessionKind] = useState(null)
  const writeTimer = useRef(null)
  const pendingHoles = useRef(null)
  const savedMatchRef = useRef(null)
  const sessionKindRef = useRef(null)

  const markSessionKind = useCallback((kind) => {
    sessionKindRef.current = kind
    setSessionKind(kind)
  }, [])

  const clearMatchState = useCallback(() => {
    persistActiveMatchId(null)
    setMatch(null)
    setPlayers([])
    setScores({})
    setSaveStatus('idle')
    setSaveError('')
    setPersonalRecord(false)
    savedMatchRef.current = null
  }, [])

  const leaveFinishedMatch = useCallback(() => {
    if (writeTimer.current) {
      clearTimeout(writeTimer.current)
      writeTimer.current = null
    }
    pendingHoles.current = null
    clearGameStorage()
    clearMatchState()
    markSessionKind(null)
  }, [clearMatchState, markSessionKind])

  const beginLocalPlay = useCallback(() => {
    markSessionKind('local')
    persistActiveMatchId(null)
    setMatch(null)
    setPlayers([])
    setScores({})
    setSaveStatus('idle')
    setSaveError('')
    setPersonalRecord(false)
  }, [markSessionKind])

  const matchId = match?.id || null
  const isOnlineMatch = Boolean(matchId) && sessionKind !== 'local'
  const isHost = Boolean(isOnlineMatch && user?.uid && match?.hostId === user.uid)

  const hydrateMatch = useCallback(async (id) => {
    const next = await getMatch(id)
    if (sessionKindRef.current === 'local') return null
    if (!next || next.status === 'abandoned') {
      persistActiveMatchId(null)
      setMatch(null)
      if (next?.status === 'abandoned') markSessionKind(null)
      return null
    }
    const [nextPlayers, nextScores] = await Promise.all([
      getMatchPlayers(id),
      getMatchScores(id),
    ])
    if (sessionKindRef.current === 'local') return null
    markSessionKind('online')
    setMatch(next)
    setPlayers(nextPlayers)
    setScores(nextScores)
    persistActiveMatchId(id)
    return next
  }, [markSessionKind])

  const refreshScores = useCallback(async (id = matchId) => {
    if (!id) return
    const nextScores = await getMatchScores(id)
    setScores(nextScores)
  }, [matchId])

  useEffect(() => {
    if (!user?.uid && sessionKindRef.current !== 'local') {
      clearMatchState()
      markSessionKind(null)
    }
  }, [user?.uid, clearMatchState, markSessionKind])

  useEffect(() => {
    if (sessionKind === 'local' || !user?.uid) return undefined
    const stored = readActiveMatchId()
    if (!stored) return undefined
    let cancelled = false
    hydrateMatch(stored).then((next) => {
      if (cancelled || !next || sessionKindRef.current === 'local') return
      if (next.status === 'finished') {
        navigate('/results', { replace: true, state: { fromMatch: true } })
      } else if (next.status === 'playing' && next.mode) {
        const route = MODE_ROUTES[next.mode]
        const path = window.location.pathname
        if (path === '/newplayers' || path.startsWith('/newplayers')) return
        if (route && !path.startsWith('/gamemodes') && !path.startsWith('/results')) {
          navigate(route)
        }
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [user?.uid, sessionKind, hydrateMatch, navigate])

  useEffect(() => {
    if (sessionKind === 'local' || !matchId || match?.status === 'finished' || match?.status === 'abandoned') return undefined
    const unsubMatch = listenMatch(matchId, (next) => {
      if (!next || sessionKindRef.current === 'local') return
      if (next.status === 'abandoned') {
        leaveFinishedMatch()
        navigate('/jugar', { replace: true })
        return
      }
      setMatch(next)
      const path = window.location.pathname
      if (path === '/newplayers' || path.startsWith('/newplayers')) return
      if (next.status === 'playing' && next.mode) {
        const route = MODE_ROUTES[next.mode]
        if (route && (path.includes('/lobby') || path === '/gamemodes' || path === '/jugar' || path === '/match/join' || path === '/match/create')) {
          navigate(route)
        }
      }
      if (next.status === 'finished') {
        navigate('/results', { state: { fromMatch: true } })
      }
    })
    const unsubPlayers = listenMatchPlayers(matchId, setPlayers)
    return () => {
      unsubMatch()
      unsubPlayers()
    }
  }, [sessionKind, matchId, match?.status, navigate, leaveFinishedMatch])

  useEffect(() => {
    if (sessionKind === 'local' || !matchId || match?.status !== 'playing') return undefined
    const poll = setInterval(() => {
      refreshScores().catch(() => {})
    }, SCORE_POLL_MS)
    return () => clearInterval(poll)
  }, [sessionKind, matchId, match?.status, refreshScores])

  useEffect(() => {
    if (sessionKind === 'local' || !matchId) return undefined
    const onFcm = (event) => {
      const data = event.detail || {}
      const payload = data.data || data
      if (!payload?.matchId || payload.matchId !== matchId) return
      if (payload.type === 'scoreUpdated') refreshScores().catch(() => {})
      if (payload.type === 'matchFinished') {
        hydrateMatch(payload.matchId).then(() => {
          navigate('/results', { state: { fromMatch: true } })
        })
      }
    }
    window.addEventListener('zp-fcm', onFcm)
    return () => window.removeEventListener('zp-fcm', onFcm)
  }, [sessionKind, matchId, refreshScores, hydrateMatch, navigate])

  const createMatch = useCallback(async () => {
    if (!user?.uid) throw new Error('Inicia sesión para crear una partida')
    markSessionKind('online')
    const created = await createMatchDoc(user.uid, profile)
    await hydrateMatch(created.matchId)
    return created
  }, [user?.uid, profile, hydrateMatch, markSessionKind])

  const joinMatch = useCallback(async (code) => {
    if (!user?.uid) throw new Error('Inicia sesión para unirte')
    markSessionKind('online')
    const id = await joinMatchDoc(user.uid, profile, code)
    await hydrateMatch(id)
    return id
  }, [user?.uid, profile, hydrateMatch, markSessionKind])

  const startMatch = useCallback(async (mode) => {
    if (!matchId) throw new Error('No hay partida activa')
    await startMatchDoc(matchId, mode)
    setMatch((prev) => (prev ? { ...prev, status: 'playing', mode } : prev))
  }, [matchId])

  const flushScore = useCallback(async () => {
    if (!matchId || !user?.uid || !pendingHoles.current) return
    const holes = pendingHoles.current
    pendingHoles.current = null
    await writePlayerScore(matchId, user.uid, holes)
  }, [matchId, user?.uid])

  const writeMyHoleScore = useCallback((holeId, value) => {
    if (!matchId || !user?.uid) return
    setScores((prev) => {
      const current = prev[user.uid] || { holes: {}, total: 0 }
      const holes = { ...(current.holes || {}), [holeId]: value }
      const total = computeTotalFromHoles(holes)
      pendingHoles.current = holes
      return { ...prev, [user.uid]: { ...current, holes, total } }
    })
    if (writeTimer.current) clearTimeout(writeTimer.current)
    writeTimer.current = setTimeout(() => {
      flushScore().catch(() => {})
    }, SCORE_WRITE_DEBOUNCE_MS)
  }, [matchId, user?.uid, flushScore])

  const finishMatch = useCallback(async () => {
    if (!isHost || !match) throw new Error('Solo el anfitrión puede finalizar')
    setSaveStatus('saving')
    setSaveError('')
    try {
      await flushScore()
      const latestScores = await getMatchScores(match.id)
      setScores(latestScores)
      await finishMatchInFirestore(match.id, match.joinCode)
      const myTotal = Number(latestScores[user.uid]?.total ?? 0)
      const saved = await saveMyFinishedGame({
        match: { ...match, status: 'finished' },
        uid: user.uid,
        profile,
        score: myTotal,
      })
      savedMatchRef.current = match.id
      setPersonalRecord(Boolean(saved.record))
      setMatch((prev) => (prev ? { ...prev, status: 'finished' } : prev))
      clearGameStorage()
      persistActiveMatchId(null)
      setSaveStatus('saved')
      navigate('/results', { replace: true, state: { fromMatch: true } })
      return saved
    } catch (err) {
      setSaveStatus('error')
      setSaveError(userFacingError(err, 'No se pudo guardar la partida'))
      throw err
    }
  }, [isHost, match, flushScore, user?.uid, profile, navigate])

  useEffect(() => {
    if (!match || match.status !== 'finished' || !user?.uid) return undefined
    if (savedMatchRef.current === match.id) return undefined
    let cancelled = false
    ;(async () => {
      const latest = await getMatchScores(match.id)
      if (cancelled) return
      setScores(latest)
      const myTotal = latest[user.uid]?.total
      if (myTotal == null) return
      savedMatchRef.current = match.id
      setSaveStatus('saving')
      try {
        const saved = await saveMyFinishedGame({ match, uid: user.uid, profile, score: myTotal })
        if (cancelled) return
        setPersonalRecord(Boolean(saved.record))
        setSaveStatus('saved')
        clearGameStorage()
        persistActiveMatchId(null)
      } catch {
        savedMatchRef.current = null
        setSaveStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [match, user?.uid, profile])

  const abandonMatch = useCallback(async () => {
    if (isHost && match) {
      await abandonMatchInFirestore(match.id, match.joinCode)
    }
    leaveFinishedMatch()
  }, [isHost, match, leaveFinishedMatch])

  const tableResults = useMemo(() => toTable(players, scores), [players, scores])

  const value = useMemo(
    () => ({
      match,
      matchId,
      players,
      scores,
      isHost,
      isOnlineMatch,
      sessionKind,
      saveStatus,
      saveError,
      personalRecord,
      tableResults,
      formatGameScore,
      createMatch,
      joinMatch,
      startMatch,
      writeMyHoleScore,
      refreshScores,
      finishMatch,
      abandonMatch,
      leaveFinishedMatch,
      beginLocalPlay,
      hydrateMatch,
    }),
    [
      match,
      matchId,
      players,
      scores,
      isHost,
      isOnlineMatch,
      sessionKind,
      saveStatus,
      saveError,
      personalRecord,
      tableResults,
      createMatch,
      joinMatch,
      startMatch,
      writeMyHoleScore,
      refreshScores,
      finishMatch,
      abandonMatch,
      leaveFinishedMatch,
      beginLocalPlay,
      hydrateMatch,
    ]
  )

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
}

export function useMatch() {
  const ctx = useContext(MatchContext)
  if (!ctx) throw new Error('useMatch debe usarse dentro de MatchProvider')
  return ctx
}
