import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RulesDialog from '../../components/RulesDialog/RulesDialog.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './mainView.css'
import logo from '../../img/LogoZonaP.png'

function MainView() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <div className="mainView">
      <h1>Mini Golf</h1>
      <img className="MainLogo" src={logo} alt="Mini Golf" />
      {!user ? (
        <div className="mainViewGuestActions">
          <button className="startButton" type="button" onClick={() => navigate('/login')}>
            Iniciar sesión
          </button>
          <button className="startButton startButton--local" type="button" onClick={() => setRulesOpen(true)}>
            Jugar sin Internet
          </button>
        </div>
      ) : null}
      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  )
}

export default MainView
