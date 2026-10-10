import { useRef, useState } from 'react'
import './draftcardModeView.css'
import HomeButton from '../../components/HomeButton/HomeButton.jsx'
import UserScores from '../../components/UserScores/UserScores.jsx'
import RadomCardsSelected from '../../components/RadomCardsSelected/RadomCardsSelected.jsx'
import ConfirmResetDialog from '../../components/ConfirmResetDialog/ConfirmResetDialog.jsx'
import FinishButton from '../../components/FinishButton/FinishButton.jsx'
import MatchScoreboard from '../../components/MatchScoreboard/MatchScoreboard.jsx'
import OnlineRulesOnce from '../../components/OnlineRulesOnce/OnlineRulesOnce.jsx'

function DraftcardModeView() {
  const [showConfirm, setShowConfirm] = useState(false)
  const navigateRef = useRef(null)

  const handleHomeClick = ({ navigate }) => {
    navigateRef.current = navigate
    setShowConfirm(true)
  }

  const handleConfirmReset = () => {
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue
        if (key.startsWith('zpminigolf_draftcard_assignments_')) keysToRemove.push(key)
        if (key.startsWith('zpminigolf_scores_hole_')) keysToRemove.push(key)
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch {
      // ignore
    }
    setShowConfirm(false)
    const nav = navigateRef.current
    if (typeof nav === 'function') nav('/gamemodes')
  }

  return (
    <div className="draftcardModeView">
      <HomeButton onClick={handleHomeClick} />
      <h1>Modo MiniUno</h1>
      <p className="infoText">Modo de cartas especiales: cada jugador recibe una carta aleatoria. esta carta solo se puede usar 1 vez por hoyo. en este modo de juego tambien se suman los puntos de los golpes de cada jugador y tambien si sales de la pista se suman 3 puntos.</p>
      <MatchScoreboard />
      <OnlineRulesOnce />
      <UserScores title="Hoyo 1" holeId="1" />
      <RadomCardsSelected holeId="1" />
      <UserScores title="Hoyo 2" holeId="2" />
      <RadomCardsSelected holeId="2" />
      <UserScores title="Hoyo 3" holeId="3" />
      <RadomCardsSelected holeId="3" />
      <UserScores title="Hoyo 4" holeId="4" />
      <RadomCardsSelected holeId="4" />
      <UserScores title="Hoyo 5" holeId="5" />
      <RadomCardsSelected holeId="5" />

      <ConfirmResetDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmReset}
      />
      <FinishButton />
    </div>
  )
}

export default DraftcardModeView


