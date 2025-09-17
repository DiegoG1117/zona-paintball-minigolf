import { useEffect, useMemo, useState } from 'react'
import './RadomCardsSelected.css'
import UserRandomCard from '../UserRandomCard/UserRandomCard.jsx'

function RadomCardsSelected({ holeId = 'global' }) {
  const rosterStorageKey = useMemo(() => 'zpminigolf_userScores', [])
  const assignmentsStorageKey = useMemo(() => `zpminigolf_draftcard_assignments_${holeId}`, [holeId])

  const [players, setPlayers] = useState([])
  const [hasDrawn, setHasDrawn] = useState(false)
  const [assignedCardsByPlayerId, setAssignedCardsByPlayerId] = useState({})
  const [dialogState, setDialogState] = useState({ isOpen: false, player: null, card: null })

  const specialCards = useMemo(
    () => [
      { id: 'menos-1', name: 'Menos 1 golpe', description: 'Reduce un golpe en el hoyo actual.' },
      { id: 'retroceso', name: 'Retroceso', description: 'Repite tu último tiro (una sola vez).' },
      { id: 'golpe-reverso', name: 'Golpe Reverso', description: 'Debes jugar con el palo al revés en un tiro.' },
      { id: 'lanzamiento-mano', name: 'Lanzamiento con la mano', description: 'Puedes coger la bola y lanzarla hacia adelante una sola vez.' },
      { id: 'mas-2', name: 'Más 2 golpes', description: 'Al terminar el hoyo sumarás +2 golpes.' },
    ],
    []
  )

  useEffect(() => {
    try {
      const rawRoster = localStorage.getItem(rosterStorageKey)
      const parsedRoster = rawRoster ? JSON.parse(rawRoster) : []
      if (Array.isArray(parsedRoster)) {
        setPlayers(parsedRoster)
      }
    } catch {
      setPlayers([])
    }
  }, [rosterStorageKey])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(assignmentsStorageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setAssignedCardsByPlayerId(parsed)
          setHasDrawn(Object.keys(parsed).length > 0)
        }
      }
    } catch {
      // ignore parse/persistence errors
    }
  }, [assignmentsStorageKey])

  useEffect(() => {
    try {
      if (hasDrawn) {
        localStorage.setItem(assignmentsStorageKey, JSON.stringify(assignedCardsByPlayerId))
      }
    } catch {
      // ignore write errors
    }
  }, [hasDrawn, assignedCardsByPlayerId, assignmentsStorageKey])

  const drawCardsForPlayers = () => {
    if (!players || players.length === 0) return
    const nextAssignments = players.reduce((acc, player) => {
      const card = specialCards[Math.floor(Math.random() * specialCards.length)]
      acc[player.id] = card
      return acc
    }, {})
    setAssignedCardsByPlayerId(nextAssignments)
    setHasDrawn(true)
  }

  const openPlayerCard = (playerId) => {
    const player = players.find((p) => p.id === playerId) || null
    const card = assignedCardsByPlayerId[playerId] || null
    setDialogState({ isOpen: true, player, card })
  }

  const closeDialog = () => setDialogState({ isOpen: false, player: null, card: null })

  return (
    <div className="radomCardsSelected">
      {!hasDrawn ? (
        <button
          className="drawButton"
          onClick={drawCardsForPlayers}
          disabled={players.length === 0}
          aria-label="Sortear cartas"
        >
          <span className="drawButtonIcon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </span>
          <span className="drawButtonLabel">Sortear Cartas</span>
        </button>
      ) : (
        <div className="playerButtons">
          {players.map((player) => (
            <button
              key={player.id}
              className="playerButton"
              onClick={() => openPlayerCard(player.id)}
            >
              <span className="cardIcon" aria-hidden="true">🃏</span>
              <span className="playerNameLabel">{player.name}</span>
            </button>
          ))}
        </div>
      )}

      {dialogState.isOpen && dialogState.player && dialogState.card ? (
        <UserRandomCard
          isOpen={dialogState.isOpen}
          onClose={closeDialog}
          player={dialogState.player}
          card={dialogState.card}
        />
      ) : null}
    </div>
  )
}

export default RadomCardsSelected



