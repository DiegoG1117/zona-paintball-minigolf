import { useRef, useState } from 'react'
import './draftcardModeView.css'
import HomeButton from '../../components/HomeButton/HomeButton.jsx'
import UserScores from '../../components/UserScores/UserScores.jsx'
import RadomCardsSelected from '../../components/RadomCardsSelected/RadomCardsSelected.jsx'
import ConfirmResetDialog from '../../components/ConfirmResetDialog/ConfirmResetDialog.jsx'
import FinishButton from '../../components/FinishButton/FinishButton.jsx'

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
      <UserScores title="Hoyo 1" />
      <RadomCardsSelected />
      <UserScores title="Hoyo 2" />
      <RadomCardsSelected />

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


