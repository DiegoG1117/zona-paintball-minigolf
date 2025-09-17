import { useEffect, useMemo, useState } from 'react'
import './ResultsTable.css'

function ResultsTable({ hole = 'Hoyo 1', holes = null, refreshKey = 0 }) {
  const rosterStorageKey = useMemo(() => 'zpminigolf_userScores', [])
  const resultsStorageKey = useMemo(() => 'zpminigolf_runner_results', [])

  const [players, setPlayers] = useState([])
  const [results, setResults] = useState({})

  useEffect(() => {
    try {
      const rawRoster = localStorage.getItem(rosterStorageKey)
      const parsedRoster = rawRoster ? JSON.parse(rawRoster) : []
      setPlayers(Array.isArray(parsedRoster) ? parsedRoster : [])
    } catch {
      setPlayers([])
    }
  }, [rosterStorageKey])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(resultsStorageKey)
      const parsed = raw ? JSON.parse(raw) : {}
      setResults(parsed && typeof parsed === 'object' ? parsed : {})
    } catch {
      setResults({})
    }
  }, [resultsStorageKey, refreshKey])

  const format = (ms) => {
    if (typeof ms !== 'number' || ms < 0) return '--:--'
    const totalSeconds = Math.round(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const holeList = Array.isArray(holes) && holes.length > 0 ? holes : [hole]

  return (
    <div className="resultsTable">
      <h2 className="resultsTitle">Tabla de resultados</h2>
      <div className="resultsList">
        {players.map((p) => {
          const userResults = results[p.id] || {}
          return (
            <div key={p.id} className="resultsBlock">
              <div className="resultsHeader">
                <span className="resultsPlayerName">{p.name}</span>
                <span className="resultsHeaderRight">Resultado</span>
              </div>
              {holeList.map((h) => {
                const timeMs = userResults[h]
                return (
                  <div key={p.id + '-' + h} className="resultsRow">
                    <span className="resultsHole">{h}</span>
                    <span className="resultsTime">{format(timeMs)}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
        {players.length === 0 ? (
          <div className="resultsEmpty">No hay jugadores todavía.</div>
        ) : null}
      </div>
    </div>
  )
}

export default ResultsTable


