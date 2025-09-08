import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainView from './views/mainView/mainView.jsx'
import GameModesView from './views/gameModesView/gameModesView.jsx'
import ClassicModeView from './views/classicModeView/classicModeView.jsx'
import RunnerModeView from './views/runnerModeView/runnerModeView.jsx'
import DraftcardModeView from './views/draftcardModeView/draftcardModeView.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainView />} />
      <Route path="/gamemodes" element={<GameModesView />} />
      <Route path="/gamemodes/classic" element={<ClassicModeView />} />
      <Route path="/gamemodes/runner" element={<RunnerModeView />} />
      <Route path="/gamemodes/draftcard" element={<DraftcardModeView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
