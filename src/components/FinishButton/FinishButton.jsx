import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './FinishButton.css'

function FinishButton({ label = 'Finalizar Juego' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    const perHolePrefix = 'zpminigolf_scores_hole_'
    const runnerKey = 'zpminigolf_runner_results'
    const isRunnerMode = typeof location.pathname === 'string' && location.pathname.includes('/gamemodes/runner')

    const hasAnyStroke = () => {
      try {
        let totalStrokes = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key || !key.startsWith(perHolePrefix)) continue
          const parsed = JSON.parse(localStorage.getItem(key) || '{}') || {}
          const entries = Object.values(parsed || {})
          for (const v of entries) {
            const n = Number(v)
            if (Number.isFinite(n)) totalStrokes += n
            if (totalStrokes > 0) return true
          }
        }
      } catch (err) { void err }
      return false
    }

    const hasAnyRunnerTime = () => {
      try {
        const raw = localStorage.getItem(runnerKey)
        const parsed = raw ? JSON.parse(raw) : {}
        const perUser = parsed && typeof parsed === 'object' ? parsed : {}
        for (const holeMap of Object.values(perUser)) {
          const times = Object.values(holeMap || {})
          if (times.some((t) => Number(t) > 0)) return true
        }
      } catch (err) { void err }
      return false
    }

    const recompute = () => {
      const enabled = isRunnerMode ? hasAnyRunnerTime() : hasAnyStroke()
      setIsDisabled(!enabled)
    }

    recompute()
    const id = setInterval(recompute, 800)
    return () => clearInterval(id)
  }, [location.pathname])

  const handleClick = () => {
    if (isDisabled) return
    navigate('/results', {
      state: {
        returnTo: location.pathname,
      },
    })
  }

  return (
    <div className="finishButtonWrapper">
      <button className="finishButton" onClick={handleClick} disabled={isDisabled} aria-disabled={isDisabled}>
        <span className="flagIcon" aria-hidden>🏁</span>
        {label}
      </button>
    </div>
  )
}

export default FinishButton



