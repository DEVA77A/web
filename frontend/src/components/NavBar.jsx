import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NavBar = () => {
  const loc = useLocation()

  // Hide Navbar on Login Page
  if (loc.pathname === '/') return null

  return (
    <header className="w-full py-3 px-4 md:py-4 md:px-6 flex items-center justify-between flex-wrap gap-3" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 16, 36, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div className="flex items-center gap-2 md:gap-4">
        <img src="/logo.png" alt="Logo" style={{ width: 36, height: 'auto' }} className="md:w-12" />
        <div>
          <div className="gtahero" style={{ fontSize: 18, lineHeight: 1.1 }}>Type Sprint</div>
          <div className="hero-sub" style={{ fontSize: 11, opacity: 0.8 }}>Pro Typing Arena</div>
        </div>
      </div>

      <nav className="flex items-center gap-2 flex-wrap">
        <Link to="/dashboard" className={`btn ${loc.pathname === '/dashboard' ? 'btn primary' : ''}`} style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>Dashboard</Link>
        <Link to="/game" className={`btn ${loc.pathname === '/game' ? 'btn primary' : ''}`} style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>Play</Link>
        <Link to="/leaderboard" className={`btn ${loc.pathname === '/leaderboard' ? 'btn primary' : ''}`} style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>Leaderboard</Link>
      </nav>
    </header>
  )
}

export default NavBar
