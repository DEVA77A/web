import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, getProfile, getBadge, removeUser } from '../utils/storage.js'
import { getUserProfile } from '../services/api.js'
import '../styles/Animations.css'

const ProfilePage = () => {
  const navigate = useNavigate()
  const user = getUser()
  const userId = user?.id || user?.name || 'Guest'
  const username = user?.name || 'Guest'
  const [profile, setProfile] = useState(getProfile(userId))
  const [loading, setLoading] = useState(true)
  const badge = getBadge(profile.loginStreak)
  const avgAccuracy = profile.gamesPlayed > 0 
    ? Math.round(profile.totalAccuracy / profile.gamesPlayed) 
    : 0
  
  // Use profile username if available, otherwise fall back to user name
  const displayName = profile?.username || username

  useEffect(() => {
    // Fetch profile from backend
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const backendProfile = await getUserProfile(userId)
        if (backendProfile) {
          setProfile(backendProfile)
        } else {
          // Fallback to local profile
          setProfile(getProfile(userId))
        }
      } catch (err) {
        console.warn('Failed to fetch profile, using local', err)
        setProfile(getProfile(userId))
      } finally {
        setLoading(false)
      }
    }

    if (userId && userId !== 'Guest') {
      fetchProfile()
      
      // Refresh profile when page becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden && userId && userId !== 'Guest') {
          fetchProfile()
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    } else {
      setLoading(false)
    }
  }, [userId])

  const handleLogout = () => {
    removeUser()
    navigate('/')
  }

  return (
    <>
      <div className="cyber-grid"></div>
      <div className="particles-bg">
        {[...Array(20)].map((_, i) => (
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
      
      <div className="page-center" style={{ minHeight: 'auto', height: 'auto', overflow: 'auto', paddingBottom: '2rem' }}>
        <div className="container" style={{ maxWidth: '100%', padding: '0 1rem' }}>
          <div className="glass-card">
            {/* Header with Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src="/logo.png" alt="Type Sprint Logo" style={{ width: 56, height: 'auto' }} />
                <div>
                  <h2 className="hero-title gtahero" style={{ margin: 0, fontSize: '2rem' }}>Player Profile</h2>
                  <div className="hero-sub">Your stats & achievements</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/dashboard" className="btn">Dashboard</Link>
                <Link to="/game" className="btn primary">Play Game</Link>
                <Link to="/leaderboard" className="btn">Leaderboard</Link>
                <button className="btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>

            {/* Profile Content */}
            <div style={{ marginTop: '2rem' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '12px' }}>
                  <div className="loading-spinner"></div>
                  <span className="muted">Loading profile...</span>
                </div>
              ) : (
                <>
              {/* Player Header with Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h1 className="neon-text" style={{ fontSize: '3rem', margin: 0, marginBottom: '8px' }}>
                    {displayName}
                  </h1>
                  <div style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                    Type Sprint Champion
                  </div>
                </div>
                
                {badge && (
                  <div 
                    style={{ 
                      textAlign: 'center',
                      padding: '24px',
                      background: `linear-gradient(135deg, ${badge.color}30, ${badge.color}15)`,
                      borderRadius: '20px',
                      border: `3px solid ${badge.color}60`,
                      minWidth: '160px',
                      boxShadow: `0 0 40px ${badge.color}40`
                    }}
                  >
                    <div style={{ 
                      fontSize: '4rem', 
                      marginBottom: '12px',
                      filter: `drop-shadow(0 0 20px ${badge.color})`,
                      animation: 'badge-float 3s ease-in-out infinite'
                    }}>
                      {badge.emoji}
                    </div>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      color: badge.color,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '8px',
                      textShadow: `0 0 15px ${badge.color}`
                    }}>
                      {badge.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                      {profile.loginStreak} day streak
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div className="stat-card" style={{
                  background: 'rgba(96, 165, 250, 0.15)',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(96, 165, 250, 0.4)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🏆 Highest Score
                  </div>
                  <div style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 'bold', 
                    color: '#60a5fa',
                    textShadow: '0 0 20px #60a5fa',
                    lineHeight: 1
                  }}>
                    {profile.highestScore}
                  </div>
                </div>

                <div className="stat-card" style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(34, 197, 94, 0.4)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🎯 Avg Accuracy
                  </div>
                  <div style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 'bold', 
                    color: '#22c55e',
                    textShadow: '0 0 20px #22c55e',
                    lineHeight: 1
                  }}>
                    {avgAccuracy}%
                  </div>
                </div>

                <div className="stat-card" style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🎮 Games Played
                  </div>
                  <div style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 'bold', 
                    color: '#a855f7',
                    textShadow: '0 0 20px #a855f7',
                    lineHeight: 1
                  }}>
                    {profile.totalGames}
                  </div>
                </div>

                <div className="stat-card" style={{
                  background: 'rgba(251, 191, 36, 0.15)',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🔥 Login Streak
                  </div>
                  <div style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 'bold', 
                    color: '#fbbf24',
                    textShadow: '0 0 20px #fbbf24',
                    lineHeight: 1
                  }}>
                    {profile.loginStreak}
                  </div>
                </div>
              </div>

              {/* Progress to Next Badge */}
              {profile.loginStreak < 1000 ? (
                <div style={{ 
                  padding: '24px', 
                  background: 'rgba(96, 165, 250, 0.1)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  color: '#94a3b8',
                  border: '2px solid rgba(96, 165, 250, 0.3)'
                }}>
                  {profile.loginStreak >= 500 ? (
                    <div>
                      <span style={{ fontSize: '1.5rem' }}>🎯</span>
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#ffd700', fontSize: '1.3rem' }}>{1000 - profile.loginStreak}</strong> days until <strong style={{ color: '#ffd700' }}>Grand Master</strong>! 
                        <span style={{ fontSize: '1.5rem', marginLeft: '8px' }}>👑</span>
                      </div>
                    </div>
                  ) : profile.loginStreak >= 100 ? (
                    <div>
                      <span style={{ fontSize: '1.5rem' }}>⚡</span>
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#ff6b6b', fontSize: '1.3rem' }}>{500 - profile.loginStreak}</strong> days until <strong style={{ color: '#ff6b6b' }}>Legendary</strong>! 
                        <span style={{ fontSize: '1.5rem', marginLeft: '8px' }}>⭐</span>
                      </div>
                    </div>
                  ) : profile.loginStreak >= 30 ? (
                    <div>
                      <span style={{ fontSize: '1.5rem' }}>💪</span>
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#60a5fa', fontSize: '1.3rem' }}>{100 - profile.loginStreak}</strong> days until <strong style={{ color: '#60a5fa' }}>Elite</strong>! 
                        <span style={{ fontSize: '1.5rem', marginLeft: '8px' }}>💎</span>
                      </div>
                    </div>
                  ) : profile.loginStreak >= 7 ? (
                    <div>
                      <span style={{ fontSize: '1.5rem' }}>🔥</span>
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#f59e0b', fontSize: '1.3rem' }}>{30 - profile.loginStreak}</strong> days until <strong style={{ color: '#f59e0b' }}>Veteran</strong>!
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '1.5rem' }}>✨</span>
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#a78bfa', fontSize: '1.3rem' }}>{7 - profile.loginStreak}</strong> days until <strong style={{ color: '#a78bfa' }}>Rising Star</strong>!
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  padding: '32px', 
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 215, 0, 0.15))',
                  borderRadius: '20px',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  color: '#ffd700',
                  border: '3px solid rgba(255, 215, 0, 0.5)',
                  fontWeight: 'bold',
                  animation: 'glow-pulse 2s ease-in-out infinite',
                  boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
                  You've achieved Grand Master status!
                  <div style={{ fontSize: '3rem', marginTop: '12px' }}>🏆</div>
                </div>
              )}

              {/* Back to Action */}
              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <Link to="/game" className="btn primary" style={{ fontSize: '1.2rem', padding: '16px 48px' }}>
                  Start Playing
                </Link>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
