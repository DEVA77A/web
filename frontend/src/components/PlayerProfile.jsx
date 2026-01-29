import React from 'react'
import { getProfile, getBadge } from '../utils/storage.js'

const PlayerProfile = ({ userId, compact = false }) => {
  const profile = getProfile(userId)
  const badge = getBadge(profile.loginStreak)
  const avgAccuracy = profile.gamesPlayed > 0 
    ? Math.round(profile.totalAccuracy / profile.gamesPlayed) 
    : 0

  if (compact) {
    return (
      <div className="player-profile-compact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span>{userId}</span>
        {badge && (
          <span 
            className="player-badge-compact" 
            title={`${badge.name} - ${profile.loginStreak} day streak!`}
            style={{ 
              fontSize: '1rem',
              filter: `drop-shadow(0 0 8px ${badge.color})`,
              animation: 'badge-pulse 2s ease-in-out infinite'
            }}
          >
            {badge.emoji}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="glass-card player-profile-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 className="neon-text" style={{ fontSize: '1.5rem', margin: 0 }}>
            {userId}
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
              padding: '12px',
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

      <div className="profile-stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '16px' 
      }}>
        <div className="stat-card" style={{
          background: 'rgba(96, 165, 250, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          textAlign: 'center'
        }}>
          <div className="stat-value" style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#60a5fa',
            marginBottom: '4px',
            textShadow: '0 0 10px #60a5fa'
          }}>
            {profile.highestScore}
          </div>
          <div className="stat-label" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Highest Score
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'rgba(34, 197, 94, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          textAlign: 'center'
        }}>
          <div className="stat-value" style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#22c55e',
            marginBottom: '4px',
            textShadow: '0 0 10px #22c55e'
          }}>
            {avgAccuracy}%
          </div>
          <div className="stat-label" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Avg Accuracy
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'rgba(168, 85, 247, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          textAlign: 'center'
        }}>
          <div className="stat-value" style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#a855f7',
            marginBottom: '4px',
            textShadow: '0 0 10px #a855f7'
          }}>
            {profile.totalGames}
          </div>
          <div className="stat-label" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Games Played
          </div>
        </div>

        <div className="stat-card" style={{
          background: 'rgba(251, 191, 36, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          textAlign: 'center'
        }}>
          <div className="stat-value" style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#fbbf24',
            marginBottom: '4px',
            textShadow: '0 0 10px #fbbf24'
          }}>
            {profile.loginStreak}
          </div>
          <div className="stat-label" style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Login Streak
          </div>
        </div>
      </div>

      {profile.loginStreak < 1000 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(96, 165, 250, 0.05)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          {profile.loginStreak >= 500 ? (
            <>🎯 {1000 - profile.loginStreak} days until Grand Master! 👑</>
          ) : profile.loginStreak >= 100 ? (
            <>⚡ {500 - profile.loginStreak} days until Legendary! ⭐</>
          ) : profile.loginStreak >= 30 ? (
            <>💪 {100 - profile.loginStreak} days until Elite! 💎</>
          ) : profile.loginStreak >= 7 ? (
            <>🔥 {30 - profile.loginStreak} days until Veteran!</>
          ) : (
            <>✨ {7 - profile.loginStreak} days until Rising Star!</>
          )}
        </div>
      )}
    </div>
  )
}

export default PlayerProfile
