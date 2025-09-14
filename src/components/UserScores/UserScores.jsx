import { useEffect, useMemo, useState } from 'react'
import './UserScores.css'

function UserScores({ title = 'Marcador', holeId = 'global' }) {
  // Roster of players is shared across app
  const rosterStorageKey = 'zpminigolf_userScores'
  // Per-hole strokes are stored under a hole-specific key
  const perHoleStorageKey = useMemo(() => `zpminigolf_scores_hole_${holeId}`, [holeId])

  const [players, setPlayers] = useState([])
  // UI for adding/resetting players moved to NewPlayersView

  // Load roster and hole strokes from localStorage
  useEffect(() => {
    try {
      // Load roster
      const rawRoster = localStorage.getItem(rosterStorageKey)
      const parsedRoster = rawRoster ? JSON.parse(rawRoster) : []
      const basePlayers = Array.isArray(parsedRoster)
        ? parsedRoster.map((p) => ({ id: p.id ?? crypto.randomUUID(), name: p.name ?? '', strokes: 0 }))
        : []

      // Load per-hole strokes (object map id -> strokes, or legacy array)
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

      const merged = basePlayers.map((bp) => ({
        ...bp,
        strokes: Math.max(0, Number(strokesById[bp.id] ?? 0)),
      }))
      setPlayers(merged)
    } catch {
      // ignore parse errors and start fresh
      setPlayers([])
    }
  }, [perHoleStorageKey])

  // Persist only per-hole strokes whenever they change
  useEffect(() => {
    try {
      const strokesMap = players.reduce((acc, p) => {
        acc[p.id] = p.strokes
        return acc
      }, {})
      localStorage.setItem(perHoleStorageKey, JSON.stringify(strokesMap))
    } catch {
      // ignore write errors (e.g., quota)
    }
  }, [players, perHoleStorageKey])

  

  const increment = (id) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, strokes: p.strokes + 1 } : p))
    )
  }

  const decrement = (id) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, strokes: Math.max(0, p.strokes - 1) } : p
      )
    )
  }

  

  return (
    <div className="userScores">
      <h2 className="userScoresTitle">{title}</h2>

      <div className="userScoresHeader">
        <span>Nombre</span>
        <span className="headerRight">Golpes</span>
      </div>

      <div className="userScoresList">
        {players.map((player) => (
          <div key={player.id} className="userScoresRow">
            <div className="userScoresName">{player.name}</div>
            <div className="userScoresControls">
              <button
                className="scoreBtn"
                aria-label="Restar golpe"
                onClick={() => decrement(player.id)}
                disabled={player.strokes === 0}
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
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  )
}

export default UserScores


