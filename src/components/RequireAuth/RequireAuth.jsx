import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingMask from '../LoadingMask/LoadingMask.jsx'
import '../../views/shared/screen.css'

function RequireAuth({ children }) {
  const { configured, user, profile, loading } = useAuth()
  const location = useLocation()

  if (!configured) {
    return (
      <div className="screen">
        <div className="screenCard">
          <p>Firebase no está configurado. Puedes seguir jugando en local.</p>
        </div>
      </div>
    )
  }
  if (loading) return <LoadingMask label="Cargando..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!profile) return <Navigate to="/register" replace />
  return children
}

export default RequireAuth
