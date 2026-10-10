import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './gameModesView.css'
import { MODE_ROUTES, MODES } from '../../game/constants.js'
import { useMatch } from '../../context/MatchContext.jsx'
import { userFacingError } from '../../utils/userFacingError.js'

function GameModesView() {
  const navigate = useNavigate()
  const { isOnlineMatch, isHost, startMatch, match } = useMatch()
  const [error, setError] = useState('')

  const go = async (mode) => {
    const route = MODE_ROUTES[mode]
    if (!route) return
    if (isOnlineMatch) {
      if (!isHost) return
      try {
        await startMatch(mode)
      } catch (err) {
        setError(userFacingError(err, 'No se pudo iniciar el modo'))
        return
      }
    }
    navigate(route)
  }

  const backTo = isOnlineMatch && match?.id ? `/match/${match.id}/lobby` : '/newplayers'

  return (
    <div className="gameModesView">
      <div className="topBar">
        <button type="button" className="backBtn" onClick={() => navigate(backTo)} aria-label="Volver">←</button>
        <h1>Modos de juego</h1>
      </div>
      {isOnlineMatch && !isHost ? (
        <p>Solo el anfitrión puede elegir el modo.</p>
      ) : null}
      {error ? <p className="errorText">{error}</p> : null}

      <div className="modesGrid">
        <div
          className="modeCard classic"
          onClick={() => go(MODES.classic)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(MODES.classic)}
        >
          <div className="modeIcon" aria-hidden>🎯</div>
          <h2 className="modeTitle">Modo Clásico</h2>
          <p className="modeDesc">
            Gana quien tenga menos puntos al final. Cada
            golpe cuenta como un punto.
          </p>
        </div>

        <div
          className="modeCard timer"
          onClick={() => go(MODES.runner)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(MODES.runner)}
        >
          <div className="modeIcon" aria-hidden>⏱️</div>
          <h2 className="modeTitle">Modo Contra Reloj</h2>
          <p className="modeDesc">
            Completa todos los hoyos antes de que se agote el tiempo. ¡Velocidad y
            precisión son clave!
          </p>
        </div>

        <div
          className="modeCard draft"
          onClick={() => go(MODES.miniuno)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(MODES.miniuno)}
        >
          <div className="modeIcon" aria-hidden>🃏</div>
          <h2 className="modeTitle">Modo MiniUno</h2>
          <p className="modeDesc">
            Sorteo de cartas que te darán habilidades especiales para jugar
            minigolf.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GameModesView
