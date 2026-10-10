import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProfileAvatar } from '../../avatars/catalog.jsx'
import { useMatch } from '../../context/MatchContext.jsx'
import '../shared/screen.css'

function MatchLobbyView() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { match, players, isHost, hydrateMatch } = useMatch()

  useEffect(() => {
    if (matchId && match?.id !== matchId) {
      hydrateMatch(matchId).catch(() => {})
    }
  }, [matchId, match?.id, hydrateMatch])

  return (
    <div className="screen">
      <h1>Lobby</h1>
      <div className="screenCard">
        <p className="muted">Comparte este código</p>
        <div className="joinCode">{match?.joinCode || '------'}</div>
        <p>Jugadores ({players.length})</p>
        {players.map((p) => (
          <div key={p.id} className="listRow">
            <span className="listRowName">
              <ProfileAvatar avatarId={p.avatarId} photoURL={p.photoURL} size={28} />
              <span>{p.displayName || p.username}</span>
            </span>
            {p.isHost ? <strong>Anfitrión</strong> : null}
          </div>
        ))}
        {isHost ? (
          <button className="primaryBtn" type="button" onClick={() => navigate('/gamemodes')}>
            Elegir modo y empezar
          </button>
        ) : (
          <p className="muted">Esperando a que el anfitrión elija el modo de juego...</p>
        )}
      </div>
    </div>
  )
}

export default MatchLobbyView
