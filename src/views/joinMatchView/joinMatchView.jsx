import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../../context/MatchContext.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'

function JoinMatchView() {
  const { joinMatch } = useMatch()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onJoin = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const matchId = await joinMatch(code)
      navigate(`/match/${matchId}/lobby`)
    } catch (err) {
      setError(userFacingError(err, 'No se pudo unir a la partida'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <h1>Unirse a partida</h1>
      <form className="screenCard" onSubmit={onJoin}>
        <label>
          Código
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            required
          />
        </label>
        {error ? <p className="errorText">{error}</p> : null}
        <button className="primaryBtn" type="submit" disabled={busy || code.length < 6}>
          {busy ? 'Entrando...' : 'Unirme'}
        </button>
      </form>
      {busy ? <LoadingMask label="Entrando a la partida..." /> : null}
    </div>
  )
}

export default JoinMatchView
