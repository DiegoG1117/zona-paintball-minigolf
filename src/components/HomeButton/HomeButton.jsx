import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../../context/MatchContext.jsx'
import ConfirmLeaveOnlineDialog from '../ConfirmLeaveOnlineDialog/ConfirmLeaveOnlineDialog.jsx'
import './HomeButton.css'

function HomeButton({ onClick }) {
  const navigate = useNavigate()
  const { isOnlineMatch, abandonMatch } = useMatch()
  const [showLeave, setShowLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleClick = () => {
    if (isOnlineMatch) {
      setShowLeave(true)
      return
    }
    if (typeof onClick === 'function') {
      onClick({ navigate })
    } else {
      navigate('/gamemodes')
    }
  }

  const handleConfirmLeave = async () => {
    if (leaving) return
    setLeaving(true)
    try {
      await abandonMatch()
      setShowLeave(false)
      navigate('/jugar')
    } catch {
      setLeaving(false)
    }
  }

  return (
    <div className="homeButton">
      <button type="button" className="backBtn" aria-label="Inicio" onClick={handleClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3l9 8h-3v9a1 1 0 0 1-1 1h-4v-6H11v6H7a1 1 0 0 1-1-1v-9H3l9-8z" />
        </svg>
      </button>
      <ConfirmLeaveOnlineDialog
        isOpen={showLeave}
        onCancel={() => {
          if (!leaving) setShowLeave(false)
        }}
        onConfirm={handleConfirmLeave}
      />
    </div>
  )
}

export default HomeButton
