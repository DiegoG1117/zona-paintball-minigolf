import { useState } from 'react'
import RulesDialog from '../../components/RulesDialog/RulesDialog.jsx'
import './mainView.css'

function MainView() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="main-view">
      <h1>Mini Golf</h1>
      <p>Selecciona para empezar</p>
      <div className="buttons">
        <button onClick={() => setDialogOpen(true)}>Empezar</button>
      </div>
      <RulesDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

export default MainView


