import { useEffect, useMemo, useState } from 'react'
import './AddTimeUserScore.css'

function AddTimeUserScore({ open, onClose, onConfirm, elapsedMs = 0 }) {
  const rosterStorageKey = useMemo(() => 'zpminigolf_userScores', [])
  const [players, setPlayers] = useState([])
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    if (!open) return
    try {
      const raw = localStorage.getItem(rosterStorageKey)
      const parsed = raw ? JSON.parse(raw) : []
      const safe = Array.isArray(parsed) ? parsed : []
      setPlayers(safe)
      if (safe.length > 0) setSelectedId(safe[0].id)
    } catch {
      setPlayers([])
    }
  }, [open, rosterStorageKey])

  if (!open) return null

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const handleConfirm = () => {
    const player = players.find((p) => p.id === selectedId)
    if (!player) return
    onConfirm?.({ playerId: player.id, playerName: player.name, elapsedMs })
  }

  return (
    <div className="dialogBackdrop" onClick={onClose}>
      <div className="dialogContent" onClick={(e) => e.stopPropagation()}>
        <div className="dialogHeader">
          <h3>Guardar tiempo</h3>
          <button className="buttonClose" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>
        <div className="dialogBody">
          <div className="summaryRow">
            <span>Tiempo:</span>
            <strong>{formatTime(elapsedMs)}</strong>
          </div>
          <label className="inputLabel">
            Jugador
            <select
              className="nameInput"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          {players.length === 0 ? (
            <div className="emptyState">No hay jugadores. Agrega jugadores primero.</div>
          ) : null}
        </div>
        <div className="dialogActions">
          <button className="confirmButton" onClick={handleConfirm} disabled={!selectedId}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

export default AddTimeUserScore


