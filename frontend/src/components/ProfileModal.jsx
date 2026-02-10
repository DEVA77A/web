import React, { useState } from 'react'
import { getUser, getProfile, getBadge } from '../utils/storage.js'

const ProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const user = getUser()
  const userId = user?.name || user
  const profile = getProfile(userId)
  const badge = getBadge(profile.loginStreak)
  const avgAccuracy = profile.gamesPlayed > 0
    ? Math.round(profile.totalAccuracy / profile.gamesPlayed)
    : 0

  if (!user) return null

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="profile-button"
        style={{
          background: 'rgba(96, 165, 250, 0.1)',
          border: '2px solid rgba(96, 165, 250, 0.3)',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          fontSize: '1.5rem',
          /* animation: 'profile-glow 3s ease-in-out infinite' */
        }}
        title="View Profile"
      >
        👤
        {badge && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              fontSize: '1rem',
              filter: `drop-shadow(0 0 8px ${badge.color})`,
              animation: 'badge-pulse 2s ease-in-out infinite'
            }}
          >
            {badge.emoji}
          </span>
        )}
      </button>

      {/* Profile Modal/Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
              animation: 'fade-in 0.2s ease-out'
            }}
          />

          {/* Modal Content */}
          <div
            className="profile-modal-content glass-card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: '90%',
              maxWidth: '600px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              animation: 'modal-slide-in 0.3s ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                e.target.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                e.target.style.transform = 'scale(1)'
              }}
            >
              ✕
            </button>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 className="neon-text" style={{ fontSize: '2rem', margin: 0 }}>
                  {userId}
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
                  Player Profile
                </div>
              </div>
              {badge && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}10)`,
                    borderRadius: '16px',
                    border: `2px solid ${badge.color}40`,
                    minWidth: '120px'
                  }}
                >
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '8px',
                    filter: `drop-shadow(0 0 15px ${badge.color})`,
                    animation: 'badge-float 3s ease-in-out infinite'
                  }}>
                    {badge.emoji}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: badge.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {profile.loginStreak} days
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div className="stat-card" style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#f8fafc',
                  marginBottom: '8px'
                }}>
                  {profile.highestScore}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Highest Score
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#f8fafc',
                  marginBottom: '8px'
                }}>
                  {avgAccuracy}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Avg Accuracy
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#f8fafc',
                  marginBottom: '8px'
                }}>
                  {profile.totalGames}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Games Played
                </div>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#f8fafc',
                  marginBottom: '8px'
                }}>
                  {profile.loginStreak}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Login Streak
                </div>
              </div>
            </div>

            {/* Progress to Next Badge */}
            {profile.loginStreak < 1000 && (
              <div style={{
                padding: '16px',
                background: 'rgba(96, 165, 250, 0.08)',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '0.95rem',
                color: '#cbd5e1',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {profile.loginStreak >= 500 ? (
                  <><span style={{ fontSize: '1.2rem' }}>🎯</span> <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{1000 - profile.loginStreak}</span> DAYS UNTIL <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>GRAND MASTER</span>! <span style={{ fontSize: '1.2rem' }}>👑</span></>
                ) : profile.loginStreak >= 100 ? (
                  <><span style={{ fontSize: '1.2rem' }}>⚡</span> <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{500 - profile.loginStreak}</span> DAYS UNTIL <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>LEGENDARY</span>! <span style={{ fontSize: '1.2rem' }}>⭐</span></>
                ) : profile.loginStreak >= 30 ? (
                  <><span style={{ fontSize: '1.2rem' }}>💪</span> <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{100 - profile.loginStreak}</span> DAYS UNTIL <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>ELITE</span>! <span style={{ fontSize: '1.2rem' }}>💎</span></>
                ) : profile.loginStreak >= 7 ? (
                  <><span style={{ fontSize: '1.2rem' }}>🔥</span> <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{30 - profile.loginStreak}</span> DAYS UNTIL <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>VETERAN</span>!</>
                ) : (
                  <><span style={{ fontSize: '1.2rem' }}>✨</span> <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{7 - profile.loginStreak}</span> DAYS UNTIL <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>RISING STAR</span>!</>
                )}
              </div>
            )}

            {profile.loginStreak >= 1000 && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '1.1rem',
                color: '#ffd700',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                fontWeight: 'bold',
                animation: 'glow-pulse 2s ease-in-out infinite'
              }}>
                🏆 You've achieved Grand Master status! 🏆
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default ProfileModal
