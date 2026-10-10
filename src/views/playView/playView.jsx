import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../../context/MatchContext.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import RulesDialog from '../../components/RulesDialog/RulesDialog.jsx'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'
import './playView.css'

function PlayView() {
  const { createMatch, joinMatch, beginLocalPlay } = useMatch()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [rulesOpen, setRulesOpen] = useState(false)

  const onCreate = async () => {
    setError('')
    setBusy('create')
    try {
      const created = await createMatch()
      navigate(`/match/${created.matchId}/lobby`)
    } catch (err) {
      setError(userFacingError(err, 'No se pudo crear la partida'))
    } finally {
      setBusy('')
    }
  }

  const onJoin = async (e) => {
    e.preventDefault()
    setError('')
    setBusy('join')
    try {
      const matchId = await joinMatch(code)
      navigate(`/match/${matchId}/lobby`)
    } catch (err) {
      setError(userFacingError(err, 'No se pudo unir a la partida'))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="screen screen--tabs playView">
      <h1>Jugar</h1>
      {error ? <p className="errorText playViewError">{error}</p> : null}

      <section className="screenCard screenCard--tabs playCard">
        <h2>Crear partida</h2>
        <p>Serás el anfitrión. Se genera un código numérico para que el resto se una desde su móvil.</p>
        <button className="primaryBtn" type="button" onClick={onCreate} disabled={Boolean(busy)}>
          {busy === 'create' ? 'Creando...' : 'Crear partida'}
        </button>
      </section>

      <form className="screenCard screenCard--tabs playCard" onSubmit={onJoin}>
        <h2>Unirse</h2>
        <p>Escribe el código de 6 dígitos que te compartió el anfitrión.</p>
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
        <button className="primaryBtn" type="submit" disabled={Boolean(busy) || code.length < 6}>
          {busy === 'join' ? 'Entrando...' : 'Unirme'}
        </button>
      </form>

      <section className="screenCard screenCard--tabs playCard">
        <h2>Jugar local</h2>
        <p>
          Esta partida se queda solo en este teléfono. No se guarda en el ranking y no se puede jugar
          entre varios móviles.
        </p>
        <button
          className="secondaryBtn"
          type="button"
          onClick={() => {
            beginLocalPlay()
            setRulesOpen(true)
          }}
          disabled={Boolean(busy)}
        >
          Jugar local
        </button>
      </section>

      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
      {busy ? <LoadingMask label={busy === 'join' ? 'Entrando a la partida...' : 'Creando partida...'} /> : null}
    </div>
  )
}

export default PlayView
