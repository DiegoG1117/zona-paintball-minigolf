import { useEffect, useMemo, useRef, useState } from 'react'
import './ScoreTimer.css'
import AddTimeUserScore from '../AddTimeUserScore/AddTimeUserScore.jsx'

// Props:
// - title: string (title to show)
// - setTimer: number | { minutes?: number, seconds?: number } (initial countdown time)
// - onSaved?: ({ playerId, playerName, elapsedMs }) => void
function ScoreTimer({ title = 'Tiempo', setTimer = 0, onSaved }) {
  const totalMs = useMemo(() => {
    if (typeof setTimer === 'number') {
      return Math.max(0, Math.round(setTimer)) * 1000
    }
    const minutes = Math.max(0, Math.round(Number(setTimer?.minutes ?? 0)))
    const seconds = Math.max(0, Math.round(Number(setTimer?.seconds ?? 0)))
    return (minutes * 60 + seconds) * 1000
  }, [setTimer])

  const [remainingMs, setRemainingMs] = useState(totalMs)
  const [isRunning, setIsRunning] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [finalElapsedMs, setFinalElapsedMs] = useState(0)
  const startedAtRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    setRemainingMs(totalMs)
    setIsRunning(false)
    startedAtRef.current = null
    cancelAnimationFrame(rafRef.current)
    setFinalElapsedMs(0)
  }, [totalMs])

  useEffect(() => {
    if (!isRunning) return

    const tick = () => {
      const startedAt = startedAtRef.current ?? Date.now()
      if (!startedAtRef.current) startedAtRef.current = startedAt
      const elapsed = Date.now() - startedAt
      const newRemaining = Math.max(0, totalMs - elapsed)
      setRemainingMs(newRemaining)
      if (newRemaining <= 0) {
        setIsRunning(false)
        setFinalElapsedMs(totalMs)
        setRemainingMs(totalMs) // reset visible timer to preset
        setShowDialog(true)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRunning, totalMs])

  const handleStart = () => {
    if (totalMs <= 0) return
    setRemainingMs(totalMs)
    startedAtRef.current = Date.now()
    setIsRunning(true)
  }

  const handleCancel = () => {
    setIsRunning(false)
    startedAtRef.current = null
    setRemainingMs(totalMs)
  }

  const handleFinish = () => {
    if (!isRunning && remainingMs === totalMs) return
    // capture elapsed before resetting
    const elapsed = Math.max(0, totalMs - remainingMs)
    setFinalElapsedMs(elapsed)
    setIsRunning(false)
    setRemainingMs(totalMs) // reset visible timer to preset
    startedAtRef.current = null
    setShowDialog(true)
  }

  const handleConfirmDialog = (payload) => {
    onSaved?.(payload)
    setShowDialog(false)
  }

  const format = (ms) => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div className={`scoreTimer ${isRunning ? 'is-running' : ''}`}>
      <h2 className="scoreTimerTitle">{title}</h2>
      <div className="timerDisplay" aria-live="polite">{format(remainingMs)}</div>

      {!isRunning ? (
        <button className="startButton startButton--top" onClick={handleStart} disabled={totalMs <= 0}>Iniciar</button>
      ) : (
        <div className="actionsRow">
          <div className="runningActions">
            <button className="finishButton" onClick={handleFinish}>Finalizar</button>
            <button className="cancelButton" onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      )}

      <AddTimeUserScore
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmDialog}
        elapsedMs={finalElapsedMs}
      />
    </div>
  )
}

export default ScoreTimer


