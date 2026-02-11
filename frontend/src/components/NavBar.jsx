import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, getProfile, getBadge, removeUser } from '../utils/storage.js'

const NavBar = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const userId = user?.name || user
  const profile = userId ? getProfile(userId) : null
  const badge = profile ? getBadge(profile.loginStreak) : null

  // Auto-hide state
  const [isVisible, setIsVisible] = useState(true)

  // Check if current page should have auto-hide
  const shouldAutoHide = loc.pathname === '/leaderboard' || loc.pathname === '/profile'

  const handleLogout = () => {
    removeUser()
    navigate('/')
  }

  useEffect(() => {
    if (!shouldAutoHide) {
      setIsVisible(true)
      return
    }

    // Hide navbar after a short delay on auto-hide pages
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    const handleMouseMove = (e) => {
      // Show navbar when mouse is near the top (within 100px)
      if (e.clientY < 100) {
        setIsVisible(true)
      } else if (e.clientY > 150) {
        // Hide when mouse moves away from top
        setIsVisible(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      clearTimeout(hideTimer)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [shouldAutoHide, loc.pathname])

  // Hide Navbar on Login Page
  if (loc.pathname === '/') return null

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 py-4 px-6 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-transform duration-500 ease-out ${shouldAutoHide && !isVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
    >
      <div className="container-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-10 h-auto" />
          <div className="hidden md:block">
            <div className="text-xl font-bold font-display uppercase tracking-widest leading-none">
              <span className="text-cyan-400">Type</span> Sprint
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Pro Typing Arena</div>
          </div>
        </div>

        <nav className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
          <NavLink to="/dashboard" active={loc.pathname === '/dashboard'}>Dashboard</NavLink>
          <NavLink to="/game" active={loc.pathname === '/game'}>Play</NavLink>
          <NavLink to="/leaderboard" active={loc.pathname === '/leaderboard'}>Leaderboard</NavLink>

          <Link
            to="/profile"
            className={`
              relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300
              ${loc.pathname === '/profile'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
            `}
          >
            Profile
            {badge && (
              <span className="text-base filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse">
                {badge.emoji}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`
      px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300
      ${active
        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
        : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
  >
    {children}
  </Link>
)

export default NavBar
