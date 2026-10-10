import { Link } from 'react-router-dom'

function GuestHomeLink() {
  return (
    <Link to="/" className="guestHomeLink" aria-label="Inicio">
      <svg
        className="guestHomeLinkIcon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
    </Link>
  )
}

export default GuestHomeLink
