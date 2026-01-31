import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getLeaderboard } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'
import PlayerProfile from '../components/PlayerProfile.jsx'
import OtherPlayerProfileModal from '../components/OtherPlayerProfileModal.jsx'
import MyProfileEditor from '../components/MyProfileEditor.jsx'
import '../styles/Animations.css'

const Dashboard = () => {
  const user = getUser() || 'Player'
  const navigate = useNavigate()
  const [top, setTop] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showMyProfile, setShowMyProfile] = useState(false)

  const getCrown = (index) => {
    if (index === 0) return <span className="crown-icon crown-gold">👑</span>
    if (index === 1) return <span className="crown-icon crown-silver">👑</span>
    if (index === 2) return <span className="crown-icon crown-bronze">👑</span>
    return null
  }

  const handlePlayerClick = (playerId) => {
    const currentUserId = user?.id || user?.name
    if (playerId === currentUserId) {
      setShowMyProfile(true)
    } else {
      setSelectedPlayer(playerId)
    }
  }

  useEffect(() => {
    const loadTopScores = async () => {
      setLoading(true)
      try {
        const list = await getTopScores(3)
        console.log('Dashboard received:', list)
        if (Array.isArray(list) && list.length > 0) {
          // Always use backend data - shows all users
          setTop(list.slice(0, 3))
        } else {
          // If server returns empty, show empty (don't use localStorage)
          console.warn('No scores from server')
          setTop([])
        }
      } catch (err) {
        console.error('Failed to load top scores:', err)
        // On error, show empty - don't use localStorage
        setTop([])
      } finally {
        setLoading(false)
      }
    }

    loadTopScores()
    
    // Auto-refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTopScores()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also refresh every 30 seconds when page is active
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        loadTopScores()
      }
    }, 30000)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <>
      <div className="cyber-grid"></div>
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="page-center">
        <div className="container grid md:grid-cols-2 gap-6">
        <div>
          <div className="glass-card">
            <h2 className="hero-title gtahero">Welcome, {user?.name || user}</h2>
            <p className="muted">Type words before they hit the ground. Score points, survive lives, climb the leaderboard.</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <button className="btn primary large" onClick={() => navigate('/game')}>Start Game</button>
              <button className="btn" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
              <button className="btn" onClick={() => setShowMyProfile(true)}>My Profile</button>
              <button className="btn" onClick={() => { localStorage.removeItem('typesprint_user'); navigate('/'); }}>Logout</button>
            </div>
          </div>
        </div>

        <aside>
          <div className="glass-card">
            <h3 className="mb-3">Top Players</h3>
            {loading ? (
              <div className="muted">Loading top scores...</div>
            ) : top.length === 0 ? (
              <div className="muted">No scores yet — play to be first!</div>
            ) : (
              <ol className="leader-list">
                {top.map((p, i) => (
                  <li key={p._id || i} className={`leader-row rank-${i + 1}`} style={{ '--index': i }}>
                    <div className="leader-rank">{i + 1}</div>
                    <div className="leader-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getCrown(i)}
                      <PlayerProfile 
                        userId={p.username || p.name || 'Anonymous'} 
                        compact={true}
                        isClickable={true}
                        onClick={handlePlayerClick}
                      />
                    </div>
                    <div className="leader-score score-animate">{p.score}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
        </div>

      </div>

      {/* Other Player Profile Modal */}
      {selectedPlayer && (
        <OtherPlayerProfileModal
          userId={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onBackToDashboard={() => setSelectedPlayer(null)}
        />
      )}

      {/* My Profile Editor Modal */}
      {showMyProfile && (
        <MyProfileEditor
          onClose={() => setShowMyProfile(false)}
          onBackToDashboard={() => setShowMyProfile(false)}
        />
      )}
    </>
  )
}

export default Dashboard
