import './LoadingMask.css'

function LoadingMask({ label = 'Cargando...' }) {
  return (
    <div className="loadingMask" role="status" aria-live="polite" aria-busy="true">
      <div className="loadingMaskInner">
        <span className="loadingMaskSpinner" aria-hidden="true" />
        <p className="loadingMaskLabel">{label}</p>
      </div>
    </div>
  )
}

export default LoadingMask
