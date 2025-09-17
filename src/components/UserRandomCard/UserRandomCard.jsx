import './UserRandomCard.css'

function UserRandomCard({ isOpen, onClose, player, card }) {
  if (!isOpen) return null

  const themeSuffixById = {
    'menos-1': 'Menos1',
    retroceso: 'Retroceso',
    'golpe-reverso': 'GolpeReverso',
    'lanzamiento-mano': 'LanzamientoMano',
    'mas-2': 'Mas2',
  }
  const themeClass = `userRandomCard${themeSuffixById[card?.id] || 'Default'}`

  return (
    <div className="userRandomCardBackdrop" onClick={onClose}>
      <div className={`userRandomCardModal ${themeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="userRandomCardHeader">
          <h3>
            Carta de {player?.name}
          </h3>
          <button className="userRandomCardClose" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>
        <div className="userRandomCardBody">
          <div className="userRandomCardCardTitle">🃏 {card?.name}</div>
          <div className="userRandomCardDescription">{card?.description}</div>
        </div>
        <div className="userRandomCardActions">
          <button className="userRandomCardOk" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default UserRandomCard



