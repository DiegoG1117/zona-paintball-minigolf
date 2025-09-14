import './classicModeView.css'
import UserScores from '../../components/UserScores/UserScores.jsx'
import HomeButton from '../../components/HomeButton/HomeButton.jsx'

function ClassicModeView() {

  return (
    <div className="classicModeView">
      <HomeButton />
      <h1>Modo clásico</h1>
      <p>Modo clásico del mini-golf.</p>
      <UserScores title="Hoyo 1" holeId="1" />
      <UserScores title="Hoyo 2" holeId="2" />
    </div>
  )
}

export default ClassicModeView


