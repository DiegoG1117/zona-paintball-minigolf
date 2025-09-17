import { useLocation, useNavigate } from 'react-router-dom'
import './FinishButton.css'

function FinishButton({ label = 'Finalizar Juego' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    navigate('/results', {
      state: {
        returnTo: location.pathname,
      },
    })
  }

  return (
    <div className="finishButtonWrapper">
      <button className="finishButton" onClick={handleClick}>
        <span className="flagIcon" aria-hidden>🏁</span>
        {label}
      </button>
    </div>
  )
}

export default FinishButton


