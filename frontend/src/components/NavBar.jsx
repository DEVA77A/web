import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NavBar = () => {
  const loc = useLocation()

  // Hide Navbar on Login Page
  if (loc.pathname === '/') return null

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 16, 36, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" style={{ width: 48, height: 'auto' }} />
        <div>
          <div className="gtahero" style={{ fontSize: 24, lineHeight: 1.1 }}>Type Sprint</div>
          <div className="hero-sub" style={{ fontSize: 13, opacity: 0.8 }}>Pro Typing Arena</div>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        <Link to="/dashboard" className={`btn ${loc.pathname === '/dashboard' ? 'btn primary' : ''}`}>Dashboard</Link>
        <Link to="/game" className={`btn ${loc.pathname === '/game' ? 'btn primary' : ''}`}>Play</Link>
        <Link to="/leaderboard" className={`btn ${loc.pathname === '/leaderboard' ? 'btn primary' : ''}`}>Leaderboard</Link>
      </nav>
    </header>
  )
}

export default NavBar
