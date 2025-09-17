import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './newPlayersView.css'

function NewPlayersView() {
  const navigate = useNavigate()
  const storageKey = useMemo(() => 'zpminigolf_userScores', [])
  const [players, setPlayers] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setPlayers(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(players))
    } catch {
      // ignore write errors
    }
  }, [players, storageKey])

  const handleOpenDialog = () => setIsDialogOpen(true)
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
    }
    setPlayers((prev) => [...prev, newPlayer])
    handleCloseDialog()
  }

  const handleContinue = () => navigate('/gamemodes')

  const removePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  const resetAll = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch {}
    setPlayers([])
  }

  return (
    <div className="newPlayersView">
      <div className="topbar">
        <button className="backButton" onClick={() => navigate(-1)} aria-label="Volver">←</button>
        <h1 className="title">Jugadores</h1>
        <div className="topbarRight">
          <button className="resetButton" title="Reiniciar jugadores" aria-label="Reiniciar jugadores" onClick={resetAll}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h1v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7h1a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9zm2 2h2v1h-2V5zM8 7h8v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7zm2 3a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1zm5 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="playersList">
        {players.map((player) => (
          <div key={player.id} className="playerRow">
            <div className="playerName">{player.name}</div>
            <button className="removeButton" aria-label={`Eliminar ${player.name}`} onClick={() => removePlayer(player.id)}>✕</button>
          </div>
        ))}
        {players.length === 0 ? (
          <div className="emptyState">Añade tus jugadores para comenzar</div>
        ) : null}
      </div>

      <div className="actions">
        <button className="newPlayerButton" onClick={handleOpenDialog}>Nuevo jugador</button>
        <button className="continueButton" onClick={handleContinue} disabled={players.length === 0}>Continuar</button>
      </div>

      {isDialogOpen ? (
        <div className="dialogBackdrop" onClick={handleCloseDialog}>
          <div className="dialogContent" onClick={(e) => e.stopPropagation()}>
            <div className="dialogHeader">
              <h3>Agregar jugador</h3>
              <button className="buttonClose" aria-label="Cerrar" onClick={handleCloseDialog}>×</button>
            </div>
            <div className="dialogBody">
              <label className="inputLabel">
                Nombre
                <input
                  className="nameInput"
                  type="text"
                  placeholder="Nombre del jugador"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleConfirmAdd() } }}
                  autoFocus
                />
              </label>
            </div>
            <div className="dialogActions">
              <button className="confirmButton" onClick={handleConfirmAdd} disabled={!newPlayerName.trim()}>Confirmar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NewPlayersView


