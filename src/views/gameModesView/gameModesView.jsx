import { useNavigate } from 'react-router-dom'
import './gameModesView.css'

function GameModesView() {
  const navigate = useNavigate()

  return (
    <div className="gamemodes-view">
      <h1>Modos de juego</h1>
      <div className="buttons">
        <button onClick={() => navigate('/')}>Inicio</button>
        <button onClick={() => navigate('/gamemodes/classic')}>Classic Mode</button>
        <button onClick={() => navigate('/gamemodes/runner')}>Runner Mode</button>
        <button onClick={() => navigate('/gamemodes/draftcard')}>Draftcard Mode</button>
      </div>
    </div>
  )
}

export default GameModesView


