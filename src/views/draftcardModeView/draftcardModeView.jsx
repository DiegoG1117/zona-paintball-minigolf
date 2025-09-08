import { useNavigate } from 'react-router-dom'
import './draftcardModeView.css'

function DraftcardModeView() {
  const navigate = useNavigate()

  return (
    <div className="draftcard-mode-view">
      <h1>Draftcard Mode</h1>
      <div className="buttons">
        <button onClick={() => navigate('/')}>Inicio</button>
        <button onClick={() => navigate('/gamemodes')}>Game Modes</button>
      </div>
      <p>Modo draftcard del mini-golf.</p>
    </div>
  )
}

export default DraftcardModeView


