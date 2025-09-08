import { useNavigate } from 'react-router-dom'
import './classicModeView.css'

function ClassicModeView() {
  const navigate = useNavigate()

  return (
    <div className="classic-mode-view">
      <h1>Classic Mode</h1>
      <div className="buttons">
        <button onClick={() => navigate('/')}>Inicio</button>
        <button onClick={() => navigate('/gamemodes')}>Game Modes</button>
      </div>
      <p>Modo clásico del mini-golf.</p>
    </div>
  )
}

export default ClassicModeView


