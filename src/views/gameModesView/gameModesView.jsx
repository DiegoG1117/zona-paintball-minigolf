import { useNavigate } from 'react-router-dom'
import './gameModesView.css'

function GameModesView() {
  const navigate = useNavigate()

  return (
    <div className="gameModesView">
      <div className="topBar">
        <button type="button" className="backBtn" onClick={() => navigate('/newplayers')} aria-label="Volver">←</button>
        <h1>Modos de juego</h1>
      </div>

      <div className="modesGrid">
        <div
          className="modeCard classic"
          onClick={() => navigate('/gamemodes/classic')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/gamemodes/classic')}
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
          onClick={() => navigate('/gamemodes/runner')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/gamemodes/runner')}
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
          onClick={() => navigate('/gamemodes/draftcard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/gamemodes/draftcard')}
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


