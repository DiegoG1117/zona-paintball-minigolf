import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGroup, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import './AppNav.css'

const MotionSpan = motion.span

const HIDDEN_PATHS = new Set([
  '/gamemodes',
  '/gamemodes/classic',
  '/gamemodes/runner',
  '/gamemodes/draftcard',
  '/results',
  '/newplayers',
])

const ITEMS = [
  { to: '/', end: true, label: 'Inicio' },
  { to: '/jugar', label: 'Jugar' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/profile', label: 'Perfil' },
]

function AppNav() {
  const { user } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!user || HIDDEN_PATHS.has(location.pathname)) return null

  return (
    <nav className={`appNav${scrolled ? ' is-scrolled' : ''}`} aria-label="Principal">
      <LayoutGroup id="appNavHighlight">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `appNavItem${isActive ? ' is-active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <MotionSpan
                    layoutId="appNavHighlight"
                    className="appNavHighlight"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <span className="appNavLabel">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </LayoutGroup>
    </nav>
  )
}

export default AppNav
