import './ConfirmLeaveOnlineDialog.css'

function ConfirmLeaveOnlineDialog({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null
  return (
    <div className="confirmLeaveBackdrop" onClick={onCancel}>
      <div className="confirmLeaveModal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmLeaveHeader">
          <h3>¿Deseas volver al inicio?</h3>
        </div>
        <div className="confirmLeaveBody">
          Se cerrará la partida online. Los resultados no se guardarán en el ranking.
        </div>
        <div className="confirmLeaveActions">
          <button className="btnCancel" onClick={onCancel}>Cancelar</button>
          <button className="btnConfirm" onClick={onConfirm}>Sí, salir</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmLeaveOnlineDialog
