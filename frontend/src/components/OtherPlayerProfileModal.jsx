import React, { useState, useEffect } from 'react'
import { getPlayerStats } from '../services/api.js'
import { getBadge } from '../utils/storage.js'

const OtherPlayerProfileModal = ({ userId, onClose, onBackToDashboard }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        // Fetch player stats from server (aggregates from Score collection)
        const serverStats = await getPlayerStats(userId)
        if (serverStats) {
          setProfile({
            userId: serverStats.userId || userId,
            username: serverStats.username || userId,
            highestScore: serverStats.highestScore || 0,
            totalGames: serverStats.totalGames || serverStats.gamesPlayed || 0,
            totalAccuracy: serverStats.totalAccuracy || 0,
            gamesPlayed: serverStats.gamesPlayed || serverStats.totalGames || 0,
            avgAccuracy: serverStats.avgAccuracy || 0,
            loginStreak: serverStats.loginStreak || 0,
            bio: serverStats.bio || ''
          })
        } else {
          // Show empty profile if fetch fails
          setProfile({
            userId: userId,
            username: userId,
            highestScore: 0,
            totalGames: 0,
            totalAccuracy: 0,
            gamesPlayed: 0,
            avgAccuracy: 0,
            loginStreak: 0,
            bio: ''
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        // Show empty profile on error
        setProfile({
          userId: userId,
          username: userId,
          highestScore: 0,
          totalGames: 0,
          totalAccuracy: 0,
          gamesPlayed: 0,
          avgAccuracy: 0,
          loginStreak: 0,
          bio: ''
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadProfile()
    }
  }, [userId])

  if (!userId) return null

  const badge = profile ? getBadge(profile.loginStreak) : null
  // Use pre-calculated avgAccuracy from server, or calculate if not available
  const avgAccuracy = profile?.avgAccuracy || (profile && profile.gamesPlayed > 0 
    ? Math.round(profile.totalAccuracy / profile.gamesPlayed) 
    : 0)

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="glass-card w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          boxShadow: '0 0 40px rgba(96, 165, 250, 0.2)'
        }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-slate-400">Loading profile...</p>
          </div>
        ) : profile ? (
          <div className="p-6">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="neon-text" style={{ fontSize: '1.75rem', margin: 0 }}>
                  {profile.username || userId}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                  Player Profile
                </div>
              </div>
              {badge && (
                <div 
                  className="player-badge-large" 
                  style={{ 
                    textAlign: 'center',
                    padding: '12px 16px',
                    background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}10)`,
                    borderRadius: '12px',
                    border: `2px solid ${badge.color}40`,
                    minWidth: '100px'
                  }}
                >
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '4px',
                    filter: `drop-shadow(0 0 12px ${badge.color})`,
                    animation: 'badge-float 3s ease-in-out infinite'
                  }}>
                    {badge.emoji}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    color: badge.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {profile.loginStreak} days
                  </div>
                </div>
              )}
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(148, 163, 184, 0.05)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                borderLeft: '3px solid #60a5fa'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Bio</div>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'rgba(96, 165, 250, 0.1)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  color: '#60a5fa',
                  textShadow: '0 0 10px #60a5fa'
                }}>
                  {profile.highestScore}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Highest Score
                </div>
              </div>

              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  color: '#22c55e',
                  textShadow: '0 0 10px #22c55e'
                }}>
                  {avgAccuracy}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Avg Accuracy
                </div>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  color: '#a855f7',
                  textShadow: '0 0 10px #a855f7'
                }}>
                  {profile.totalGames}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Games Played
                </div>
              </div>

              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  color: '#fbbf24',
                  textShadow: '0 0 10px #fbbf24'
                }}>
                  {profile.loginStreak}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Login Streak
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn"
                onClick={onClose}
                style={{ minWidth: '120px' }}
              >
                Close
              </button>
              {onBackToDashboard && (
                <button 
                  className="btn primary"
                  onClick={onBackToDashboard}
                  style={{ minWidth: '150px' }}
                >
                  🏠 Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-400">Could not load profile</p>
            <button className="btn mt-4" onClick={onClose}>Close</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default OtherPlayerProfileModal
