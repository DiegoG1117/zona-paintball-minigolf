import { useCallback, useMemo, useRef, useState } from 'react'
import './runnerModeView.css'
import HomeButton from '../../components/HomeButton/HomeButton.jsx'
import UserScores from '../../components/UserScores/UserScores.jsx'
import ScoreTimer from '../../components/ScoreTimer/ScoreTimer.jsx'
import ResultsTable from '../../components/ResultsTable/ResultsTable.jsx'
import ConfirmResetDialog from '../../components/ConfirmResetDialog/ConfirmResetDialog.jsx'
import FinishButton from '../../components/FinishButton/FinishButton.jsx'

function RunnerModeView() {
  const resultsStorageKey = useMemo(() => 'zpminigolf_runner_results', [])
  const [refreshKey, setRefreshKey] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigateRef = useRef(null)

  const saveResult = useCallback(({ playerId, elapsedMs }, holeLabel) => {
    try {
      const raw = localStorage.getItem(resultsStorageKey)
      const parsed = raw ? JSON.parse(raw) : {}
      const next = { ...(parsed && typeof parsed === 'object' ? parsed : {}) }
      const userMap = { ...(next[playerId] || {}) }
      userMap[holeLabel] = elapsedMs
      next[playerId] = userMap
      localStorage.setItem(resultsStorageKey, JSON.stringify(next))
      setRefreshKey((k) => k + 1)
    } catch {
      // ignore
    }
  }, [resultsStorageKey])

  const handleHomeClick = ({ navigate }) => {
    navigateRef.current = navigate
    setShowConfirm(true)
  }

  const handleConfirmReset = () => {
    try {
      localStorage.removeItem(resultsStorageKey)
    } catch {
      // ignore
    }
    setRefreshKey((k) => k + 1)
    setShowConfirm(false)
    const nav = navigateRef.current
    if (typeof nav === 'function') nav('/gamemodes')
  }

  return (
    <div className="runner-mode-view">
      <HomeButton onClick={handleHomeClick} />
      <h1>Runner Mode</h1>
      <p className="infoText">Completa los hoyos antes de que se acabe el tiempo. Un jugador controla el
      cronómetro: inicia al empezar y detiene al terminar. Al finalizar cada hoyo, pulsa el botón rojo y registra el tiempo seleccionando al jugador en la lista.</p>
      <ScoreTimer title="Hoyo 1" setTimer={{ minutes: 0, seconds: 30 }} onSaved={(data) => saveResult(data, 'Hoyo 1')} />
      <ScoreTimer title="Hoyo 2" setTimer={{ minutes: 1, seconds: 30 }} onSaved={(data) => saveResult(data, 'Hoyo 2')} />
      <ScoreTimer title="Hoyo 3" setTimer={{ minutes: 1, seconds: 0}} onSaved={(data) => saveResult(data, 'Hoyo 3')} />

      <ResultsTable holes={["Hoyo 1", "Hoyo 2", "Hoyo 3"]} refreshKey={refreshKey} />

      <ConfirmResetDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmReset}
      />
      <FinishButton />
    </div>
  )
}

export default RunnerModeView


