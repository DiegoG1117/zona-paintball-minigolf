import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './resultsView.css'

function ResultsView() {
  const navigate = useNavigate()
  const location = useLocation()
  const rosterStorageKey = useMemo(() => 'zpminigolf_userScores', [])
  const perHolePrefix = useMemo(() => 'zpminigolf_scores_hole_', [])
  const runnerKey = useMemo(() => 'zpminigolf_runner_results', [])

  const [podium, setPodium] = useState([])

  useEffect(() => {
    try {
      const rawRoster = localStorage.getItem(rosterStorageKey)
      const players = rawRoster ? JSON.parse(rawRoster) : []
      const playerList = Array.isArray(players) ? players : []

      // Determine mode from where we came from; fallback to storage keys
      const cameFrom = location.state?.returnTo || ''
      const cameFromRunner = typeof cameFrom === 'string' && cameFrom.includes('/gamemodes/runner')

      // Enumerate storage keys robustly
      const storageKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k) storageKeys.push(k)
      }
      const holeKeys = storageKeys.filter((k) => k && k.startsWith(perHolePrefix))

      let results = []

      if (!cameFromRunner && holeKeys.length > 0) {
        const strokeByPlayer = {}
        holeKeys.forEach((hk) => {
          try {
            const perHole = JSON.parse(localStorage.getItem(hk) || '{}') || {}
            Object.entries(perHole).forEach(([pid, strokes]) => {
              const s = Number(strokes)
              strokeByPlayer[pid] = (strokeByPlayer[pid] || 0) + (Number.isFinite(s) ? s : 0)
            })
          } catch {}
        })

        results = playerList.map((p) => ({
          id: p.id,
          name: p.name,
          score: strokeByPlayer[p.id] ?? 0,
        }))

        // In stroke play, lower score is better. Sort ascending
        results.sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      } else {
        // 2) Runner mode: sum elapsedMs across holes per player; smaller is better
        let runner = {}
        try {
          const rawRunner = localStorage.getItem(runnerKey)
          const parsed = rawRunner ? JSON.parse(rawRunner) : {}
          runner = parsed && typeof parsed === 'object' ? parsed : {}
        } catch {}

        const totalMsByPlayer = {}
        Object.entries(runner).forEach(([pid, holeMap]) => {
          const total = Object.values(holeMap || {}).reduce((acc, v) => acc + (Number(v) || 0), 0)
          totalMsByPlayer[pid] = total
        })

        results = playerList.map((p) => ({
          id: p.id,
          name: p.name,
          score: totalMsByPlayer[p.id] ?? Number.POSITIVE_INFINITY,
        }))
        results.sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      }

      setPodium(results.slice(0, 3))
    } catch {
      setPodium([])
    }
  }, [rosterStorageKey, perHolePrefix, runnerKey, location.state])

  const handleReplay = () => {
    const from = location.state?.returnTo
    if (from && typeof from === 'string') navigate(from)
    else navigate('/gamemodes')
  }

  return (
    <div className="resultsView">
      <div className="winnerHeader">
        {podium[0] ? (
          <>
            <div className="crown" aria-hidden>👑</div>
            <div className="winnerTitle">¡GANADOR!</div>
            <div className="winnerName">{podium[0].name}</div>
          </>
        ) : (
          <div className="winnerTitle">Resultados</div>
        )}
      </div>

      <div className="podiumCard">
        <h3 className="podiumTitle">Podio Final</h3>
        <div className={`podiumColumns count-${Math.min(3, Math.max(0, podium.length))}`}>
          {podium.slice(0, 3).map((p, idx) => (
            <div key={p.id} className={`podiumPlace place-${idx + 1}`}>
              <div className="placeNumber">{idx + 1}</div>
              <div className="placeName">{p.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="replayButton" onClick={handleReplay}>Volver a jugar</button>
      </div>
    </div>
  )
}

export default ResultsView


