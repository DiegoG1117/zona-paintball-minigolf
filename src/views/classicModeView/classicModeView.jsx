import { useNavigate } from 'react-router-dom'
import './classicModeView.css'
import UserScores from '../../components/UserScores/UserScores.jsx'

function ClassicModeView() {
  const navigate = useNavigate()

  return (
    <div className="classic-mode-view">
      <h1>Classic Mode</h1>
      <div className="buttons">
        <button onClick={() => navigate('/gamemodes')}>Game Modes</button>
      </div>
      <p>Modo clásico del mini-golf.</p>
      <UserScores title="Marcador de jugadores" />
    </div>
  )
}

export default ClassicModeView


