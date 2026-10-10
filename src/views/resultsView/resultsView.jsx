import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './resultsView.css'
import { computeLocalResults, formatGameScore } from '../../game/computeLocalResults.js'
import { MODE_ROUTES } from '../../game/constants.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useMatch } from '../../context/MatchContext.jsx'

function ResultsView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const {
    match,
    isHost,
    isOnlineMatch,
    tableResults,
    saveStatus,
    saveError,
    personalRecord,
    finishMatch,
    leaveFinishedMatch,
  } = useMatch()

  const localComputed = useMemo(() => {
    try {
      return computeLocalResults({ returnTo: location.state?.returnTo || '' })
    } catch {
      return { results: [], mode: 'classic' }
    }
  }, [location.state])

  const online = isOnlineMatch || Boolean(location.state?.fromMatch && match)
  const allResults = online && tableResults.length > 0 ? tableResults : localComputed.results
  const podium = allResults.slice(0, 3)
  const mode = online ? (match?.mode || localComputed.mode) : localComputed.mode

  const myResult = user
    ? allResults.find((r) => r.id === user.uid)
    : null

  const handleReplay = () => {
    if (online) {
      navigate('/', { replace: true })
      return
    }
    const from = location.state?.returnTo
    if (from && typeof from === 'string') navigate(from)
    else navigate('/gamemodes')
  }

  const handleExit = () => {
    leaveFinishedMatch()
    navigate('/', { replace: true })
  }

  const handleHostFinish = async () => {
    try {
      await finishMatch()
    } catch {
      // error is surfaced via saveError; keep local scores
    }
  }

  const showHostFinish = online && isHost && match?.status === 'playing'
  const waitingForHost = online && !isHost && match?.status === 'playing'

  return (
    <div className="resultsView">
      <div className="winnerHeader">
        {podium[0] ? (
          <>
            <div className="crown" aria-hidden>👑</div>
            <div className="winnerTitle">¡GANADOR!</div>
            <div className="winnerName">{podium[0].name}</div>
            <div className="winnerScore">{formatGameScore(mode, podium[0].score)}</div>
          </>
        ) : (
          <div className="winnerTitle">Resultados</div>
        )}
      </div>

      {myResult && Number.isFinite(myResult.score) ? (
        <div className="saveBanner">
          <p>Tu puntuación: {formatGameScore(mode, myResult.score)}</p>
          {!user ? (
            <p className="saveHint">Regístrate para guardar tu puntuación y aparecer en el ranking.</p>
          ) : online && match?.status === 'finished' ? (
            <>
              {saveStatus === 'saving' ? <p className="saveHint">Guardando resultado...</p> : null}
              {saveStatus === 'saved' ? <p className="saveOk">¡Puntuación guardada!</p> : null}
              {personalRecord ? <p className="saveRecord">🏆 ¡Nuevo récord personal!</p> : null}
              {saveStatus === 'error' ? (
                <p className="saveHint">No se pudo guardar ahora. Tu resultado sigue visible aquí.</p>
              ) : null}
            </>
          ) : !online && profile ? (
            <p className="saveHint">Las partidas locales no entran al ranking. Crea una partida online para guardar tu marca.</p>
          ) : null}
        </div>
      ) : null}

      {saveError ? <p className="saveHint">{saveError}</p> : null}
      {waitingForHost ? (
        <p className="saveHint">Esperando a que el anfitrión finalice la partida...</p>
      ) : null}

      <div className="podiumCard">
        <h3 className="podiumTitle">Podio Final</h3>
        <div className={`podiumColumns count-${Math.min(3, Math.max(0, podium.length))}`}>
          {podium.slice(0, 3).map((p, idx) => (
            <div key={p.id} className={`podiumPlace place-${idx + 1}`}>
              <div className="placeNumber">{idx + 1}</div>
              <div className="placeName">{p.name}</div>
              <div className="placeScore">{formatGameScore(mode, p.score)}</div>
            </div>
          ))}
        </div>
      </div>

      {allResults.length > 3 ? (
        <div className="fullList">
          {allResults.slice(3).map((p, idx) => (
            <div key={p.id} className="fullListRow">
              <span>{idx + 4}. {p.name}</span>
              <span>{formatGameScore(mode, p.score)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="actions">
        {showHostFinish ? (
          <button className="replayButton" onClick={handleHostFinish} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? 'Guardando...' : 'Finalizar partida'}
          </button>
        ) : null}
        {!online || match?.status === 'finished' ? (
          <>
            <button className="replayButton" onClick={handleReplay}>
              {online ? 'Crear o unirse a otra' : 'Volver a jugar'}
            </button>
            <button className="exitButton" onClick={handleExit}>Salir</button>
          </>
        ) : null}
        {online && match?.status === 'playing' && isHost ? (
          <button className="exitButton" type="button" onClick={() => navigate(MODE_ROUTES[match.mode] || '/gamemodes')}>
            Volver al juego
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ResultsView
