import './runnerModeView.css'
import HomeButton from '../../components/HomeButton/HomeButton.jsx'
import UserScores from '../../components/UserScores/UserScores.jsx'

function RunnerModeView() {

  return (
    <div className="runner-mode-view">
      <HomeButton />
      <h1>Runner Mode</h1>
      <p>Modo runner del mini-golf.</p>
    </div>
  )
}

export default RunnerModeView


