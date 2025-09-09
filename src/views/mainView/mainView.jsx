import { useState } from 'react'
import RulesDialog from '../../components/RulesDialog/RulesDialog.jsx'
import './mainView.css'

function MainView() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="main-view">
      <h1>Mini Golf</h1>
      <div className="buttons">
        <button className="start-button" onClick={() => setDialogOpen(true)}>
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


