import { useRef, useState } from 'react'
import './classicModeView.css'
import UserScores from '../../components/UserScores/UserScores.jsx'
import HomeButton from '../../components/HomeButton/HomeButton.jsx'
import ConfirmResetDialog from '../../components/ConfirmResetDialog/ConfirmResetDialog.jsx'
import FinishButton from '../../components/FinishButton/FinishButton.jsx'

function ClassicModeView() {
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
        if (key && key.startsWith('zpminigolf_scores_hole_')) keysToRemove.push(key)
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
    <div className="classicModeView">
      <HomeButton onClick={handleHomeClick} />
      <h1>Modo clásico</h1>
      <p>Modo clásico del mini-golf.</p>
      <UserScores title="Hoyo 1" holeId="1" />
      <UserScores title="Hoyo 2" holeId="2" />

      <ConfirmResetDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmReset}
      />
      <FinishButton />
    </div>
  )
}

export default ClassicModeView


