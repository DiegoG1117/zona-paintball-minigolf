import { useNavigate } from 'react-router-dom'
import './gameModesView.css'

function GameModesView() {
  const navigate = useNavigate()

  return (
    <div className="gamemodes-view">
      <div className="topbar">
        <h1>Modos de juego</h1>
      </div>

      <div className="modes-grid">
        <div
          className="mode-card classic"
          onClick={() => navigate('/gamemodes/classic')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/gamemodes/classic')}
        >
          <div className="mode-icon" aria-hidden>🎯</div>
          <h2 className="mode-title">Modo Puntuación</h2>
          <p className="mode-desc">
            Juega 9 hoyos completos. Gana quien tenga menos puntos al final. Cada
            golpe cuenta como un punto.
          </p>
        </div>

        <div
          className="mode-card timer"
          onClick={() => navigate('/gamemodes/runner')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/gamemodes/runner')}
        >
          <div className="mode-icon" aria-hidden>⏱️</div>
          <h2 className="mode-title">Modo Contra Reloj</h2>
          <p className="mode-desc">
            Completa todos los hoyos antes de que se agote el tiempo. ¡Velocidad y
            precisión son clave!
          </p>
        </div>

        <div
          className="mode-card draft"
          onClick={() => navigate('/gamemodes/draftcard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/gamemodes/draftcard')}
        >
          <div className="mode-icon" aria-hidden>🃏</div>
          <h2 className="mode-title">Modo MiniUno</h2>
          <p className="mode-desc">
            Sorteo de cartas que te darán habilidades especiales para jugar
            minigolf.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GameModesView


