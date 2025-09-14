import { useState } from 'react'
import RulesDialog from '../../components/RulesDialog/RulesDialog.jsx'
import './mainView.css'
import logo from '../../img/LogoZonaP.png'

function MainView() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="mainView">
      <h1>Mini Golf</h1>
      <img className="MainLogo" src={logo} alt="Mini Golf" />
      <div className="buttons">
        <button className="startButton" onClick={() => setDialogOpen(true)}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7-11-7z" fill="currentColor"/>
          </svg>
          <span>Comenzar Partida</span>
        </button>
      </div>
      <RulesDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

export default MainView


