import { useEffect, useMemo, useState } from 'react'
import './UserScores.css'

function UserScores({ title = 'Marcador' }) {
  const storageKey = useMemo(() => 'zpminigolf_userScores', [])

  const [players, setPlayers] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setPlayers(parsed)
        }
      }
    } catch (err) {
      // ignore parse errors and start fresh
    }
  }, [storageKey])

  // Persist players whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(players))
    } catch (err) {
      // ignore write errors (e.g., quota)
    }
  }, [players, storageKey])

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setNewPlayerName('')
  }

  const handleConfirmAdd = () => {
    const name = newPlayerName.trim()
    if (!name) return
    const newPlayer = {
      id: crypto.randomUUID(),
      name,
      strokes: 0,
    }
    setPlayers((prev) => [...prev, newPlayer])
    handleCloseDialog()
  }

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
        <span>Golpes</span>
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

      <div className="userScoresActions">
        <button className="newPlayerBtn" onClick={handleOpenDialog}>Nuevo jugador</button>
      </div>

      {isDialogOpen ? (
        <div className="userScoresDialogBackdrop" onClick={handleCloseDialog}>
          <div className="userScoresDialogContent" onClick={(e) => e.stopPropagation()}>
            <div className="userScoresDialogHeader">
              <h3>Agregar jugador</h3>
              <button
                className="buttonClose"
                aria-label="Cerrar"
                onClick={handleCloseDialog}
              >
                ×
              </button>
            </div>
            <div className="userScoresDialogBody">
              <label className="inputLabel">
                Nombre
                <input
                  className="nameInput"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleConfirmAdd()
                    }
                  }}
                  autoFocus
                />
              </label>
            </div>
            <div className="userScoresDialogActions">
              <button className="confirmBtn" onClick={handleConfirmAdd} disabled={!newPlayerName.trim()}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UserScores


