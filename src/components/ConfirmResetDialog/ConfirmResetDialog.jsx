import './ConfirmResetDialog.css'

function ConfirmResetDialog({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null
  return (
    <div className="confirmResetBackdrop" onClick={onCancel}>
      <div className="confirmResetModal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmResetHeader">
          <h3>¿Deseas volver al inicio?</h3>
        </div>
        <div className="confirmResetBody">
          Se reiniciará el (sorteo de cartas, golpes, tiempo) registrados. La lista de jugadores se mantendrá.
        </div>
        <div className="confirmResetActions">
          <button className="btnCancel" onClick={onCancel}>Cancelar</button>
          <button className="btnConfirm" onClick={onConfirm}>Sí, reiniciar</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmResetDialog



