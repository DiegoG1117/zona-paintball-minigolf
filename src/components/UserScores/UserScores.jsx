import { useEffect, useMemo, useState } from 'react'
import './UserScores.css'
import { useAuth } from '../../context/AuthContext.jsx'
import { useMatch } from '../../context/MatchContext.jsx'

function UserScores({ title = 'Marcador', holeId = 'global' }) {
  const rosterStorageKey = 'zpminigolf_userScores'
  const perHoleStorageKey = useMemo(() => `zpminigolf_scores_hole_${holeId}`, [holeId])
  const { user } = useAuth()
  const { isOnlineMatch, players: matchPlayers, scores, writeMyHoleScore } = useMatch()

  const [players, setPlayers] = useState([])

  useEffect(() => {
    if (isOnlineMatch) {
      const merged = matchPlayers.map((p) => ({
        id: p.id,
        name: p.displayName || p.username || 'Jugador',
        strokes: Math.max(0, Number(scores[p.id]?.holes?.[holeId] ?? 0)),
      }))
      setPlayers(merged)
      return
    }
    try {
      const rawRoster = localStorage.getItem(rosterStorageKey)
      const parsedRoster = rawRoster ? JSON.parse(rawRoster) : []
      const basePlayers = Array.isArray(parsedRoster)
        ? parsedRoster.map((p) => ({ id: p.id ?? crypto.randomUUID(), name: p.name ?? '', strokes: 0 }))
        : []

      const rawHole = localStorage.getItem(perHoleStorageKey)
      let strokesById = {}
      if (rawHole) {
        const parsedHole = JSON.parse(rawHole)
        if (Array.isArray(parsedHole)) {
          strokesById = parsedHole.reduce((acc, entry) => {
            if (entry && entry.id) acc[entry.id] = typeof entry.strokes === 'number' ? entry.strokes : 0
            return acc
          }, {})
        } else if (parsedHole && typeof parsedHole === 'object') {
          strokesById = parsedHole
        }
      }

      setPlayers(basePlayers.map((bp) => ({
        ...bp,
        strokes: Math.max(0, Number(strokesById[bp.id] ?? 0)),
      })))
    } catch {
      setPlayers([])
    }
  }, [isOnlineMatch, matchPlayers, scores, holeId, perHoleStorageKey])

  useEffect(() => {
    if (isOnlineMatch) return undefined
    try {
      const strokesMap = players.reduce((acc, p) => {
        acc[p.id] = p.strokes
        return acc
      }, {})
      localStorage.setItem(perHoleStorageKey, JSON.stringify(strokesMap))
    } catch {
      // ignore write errors (e.g., quota)
    }
    return undefined
  }, [players, perHoleStorageKey, isOnlineMatch])

  const setStrokes = (id, nextValue) => {
    const strokes = Math.max(0, nextValue)
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, strokes } : p)))
    if (isOnlineMatch) writeMyHoleScore(holeId, strokes)
  }

  const increment = (id) => {
    const current = players.find((p) => p.id === id)
    setStrokes(id, (current?.strokes || 0) + 1)
  }

  const decrement = (id) => {
    const current = players.find((p) => p.id === id)
    setStrokes(id, Math.max(0, (current?.strokes || 0) - 1))
  }

  return (
    <div className="userScores">
      <h2 className="userScoresTitle">{title}</h2>

      <div className="userScoresHeader">
        <span>Nombre</span>
        <span className="headerRight">Golpes</span>
      </div>

      <div className="userScoresList">
        {players.map((player) => {
          const canEdit = !isOnlineMatch || player.id === user?.uid
          return (
            <div key={player.id} className="userScoresRow">
              <div className="userScoresName">{player.name}</div>
              <div className="userScoresControls">
                <button
                  className="scoreBtn"
                  aria-label="Restar golpe"
                  onClick={() => decrement(player.id)}
                  disabled={!canEdit || player.strokes === 0}
                >
                  −
                </button>
                <input
                  className="scoreInput"
                  type="number"
                  value={player.strokes}
                  readOnly
                />
                <button
                  className="scoreBtn"
                  aria-label="Sumar golpe"
                  onClick={() => increment(player.id)}
                  disabled={!canEdit}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UserScores
