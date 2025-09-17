import { useNavigate } from 'react-router-dom'
import './HomeButton.css'

function HomeButton({ onClick }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick({ navigate })
    } else {
      navigate('/gamemodes')
    }
  }

  return (
    <div className="homeButton">
      <button onClick={handleClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3l9 8h-3v9a1 1 0 0 1-1 1h-4v-6H11v6H7a1 1 0 0 1-1-1v-9H3l9-8z" />
        </svg>
      </button>
    </div>
  )
}

export default HomeButton


