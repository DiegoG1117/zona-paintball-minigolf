import { formatGameScore } from '../../game/computeLocalResults.js'
import { ProfileAvatar } from '../../avatars/catalog.jsx'
import { useMatch } from '../../context/MatchContext.jsx'
import './MatchScoreboard.css'

function MatchScoreboard() {
  const { isOnlineMatch, tableResults, match } = useMatch()
  if (!isOnlineMatch) return null
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="matchBoard">
      <h3>Marcador de la mesa</h3>
      {tableResults.map((row, idx) => (
        <div key={row.id} className="matchBoardRow">
          <span>{medals[idx] || `${idx + 1}.`}</span>
          <ProfileAvatar avatarId={row.avatarId} photoURL={row.photoURL} size={28} className="matchBoardAvatar" />
          <span className="matchBoardName">{row.name}</span>
          <strong>{formatGameScore(match?.mode, row.score)}</strong>
        </div>
      ))}
    </div>
  )
}

export default MatchScoreboard
