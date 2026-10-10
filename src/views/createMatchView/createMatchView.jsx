import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../../context/MatchContext.jsx'
import LoadingMask from '../../components/LoadingMask/LoadingMask.jsx'
import { userFacingError } from '../../utils/userFacingError.js'
import '../shared/screen.css'

function CreateMatchView() {
  const { createMatch } = useMatch()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onCreate = async () => {
    setError('')
    setBusy(true)
    try {
      const created = await createMatch()
      navigate(`/match/${created.matchId}/lobby`)
    } catch (err) {
      setError(userFacingError(err, 'No se pudo crear la partida'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <h1>Crear partida</h1>
      <div className="screenCard">
        <p>Serás el anfitrión. Se genera un código numérico para que el resto se una desde su móvil.</p>
        {error ? <p className="errorText">{error}</p> : null}
        <button className="primaryBtn" type="button" onClick={onCreate} disabled={busy}>
          {busy ? 'Creando...' : 'Crear partida'}
        </button>
      </div>
      {busy ? <LoadingMask label="Creando partida..." /> : null}
    </div>
  )
}

export default CreateMatchView
