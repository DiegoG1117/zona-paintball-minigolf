import './DataConsentDialog.css'

function DataConsentDialog({ open, onClose }) {
  if (!open) return null

  return (
    <div className="dataConsentBackdrop" onClick={onClose}>
      <div
        className="dataConsentModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dataConsentTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dataConsentHeader">
          <h3 id="dataConsentTitle">Autorización de uso de datos</h3>
          <button
            type="button"
            className="dataConsentClose"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dataConsentBody">
          <p>
            El responsable del tratamiento es Zona Paintball Cali. Los datos se usan de forma
            exclusiva para la operación de Zona Paintball Cali y de esta aplicación. No se venden
            ni se ceden a terceros para otros fines.
          </p>
          <p>
            Los datos que se piden son correo, nombre visible, username, icono de perfil y, al
            jugar, puntajes, historial de partidas y el aviso del teléfono si activas notificaciones.
            La contraseña la guarda el inicio de sesión y no se muestra a otras personas.
          </p>
          <p>
            Se usan para crear y mantener la cuenta, identificarte en partidas y en el ranking,
            mostrar tu perfil y enviarte avisos de la partida si los aceptas.
          </p>
          <p>
            Esta autorización es voluntaria. Sin ella no se puede crear la cuenta.
          </p>
          <p>
            Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos, y a revocar
            esta autorización, desde tu perfil o pidiéndolo directamente a Zona Paintball Cali.
          </p>
          <p>
            Los datos se conservan mientras la cuenta exista. Si cierras la cuenta, se dejan de
            usar para el servicio. Este aviso se da de acuerdo con la Ley 1581 de 2012.
          </p>
        </div>
        <div className="dataConsentActions">
          <button className="primaryBtn" type="button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataConsentDialog
