import { useNavigate } from 'react-router-dom'
import './runnerModeView.css'

function RunnerModeView() {
  const navigate = useNavigate()

  return (
    <div className="runner-mode-view">
      <h1>Runner Mode</h1>
      <div className="buttons">
        <button onClick={() => navigate('/')}>Inicio</button>
        <button onClick={() => navigate('/gamemodes')}>Game Modes</button>
      </div>
      <p>Modo runner del mini-golf.</p>
    </div>
  )
}

export default RunnerModeView


