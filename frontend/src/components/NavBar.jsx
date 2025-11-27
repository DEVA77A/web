import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const NavBar = () => {
  const loc = useLocation()
  return (
    <header className="w-full py-3 px-4 flex items-center justify-between glass-card" style={{position:'sticky',top:12,zIndex:50,margin:'0 1rem'}}>
      <div className="flex items-center gap-4">
        <div className="logo-badge">FF</div>
        <div>
          <div className="gtahero" style={{fontSize:18}}>FingerFury</div>
          <div className="hero-sub" style={{fontSize:12}}>Type Sprint</div>
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
