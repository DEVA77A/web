import React, { useState, useEffect } from 'react'
import { getUser, getBadge, setUser } from '../utils/storage.js'
import { getPlayerStats, updateUserProfile, checkUsernameAvailable, updateUserBio } from '../services/api.js'

const MyProfileEditor = ({ onClose, onBackToDashboard, onProfileUpdate }) => {
  const user = getUser()
  const userId = user?.id || user?.name
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [bio, setBio] = useState('')
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        // Fetch player stats from server (aggregates from Score collection)
        const username = user?.name || userId
        const serverStats = await getPlayerStats(username)
        if (serverStats) {
          setProfile({
            userId: serverStats.userId || userId,
            username: serverStats.username || username,
            highestScore: serverStats.highestScore || 0,
            totalGames: serverStats.totalGames || serverStats.gamesPlayed || 0,
            totalAccuracy: serverStats.totalAccuracy || 0,
            gamesPlayed: serverStats.gamesPlayed || serverStats.totalGames || 0,
            avgAccuracy: serverStats.avgAccuracy || 0,
            loginStreak: serverStats.loginStreak || 0,
            bio: serverStats.bio || ''
          })
          setBio(serverStats.bio || '')
          setNewName(serverStats.username || username)
        } else {
          // Show empty profile if fetch fails
          setProfile({
            userId: userId,
            username: username,
            highestScore: 0,
            totalGames: 0,
            totalAccuracy: 0,
            gamesPlayed: 0,
            avgAccuracy: 0,
            loginStreak: 0,
            bio: ''
          })
          setNewName(username)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        const username = user?.name || userId
        setProfile({
          userId: userId,
          username: username,
          highestScore: 0,
          totalGames: 0,
          totalAccuracy: 0,
          gamesPlayed: 0,
          avgAccuracy: 0,
          loginStreak: 0,
          bio: ''
        })
        setNewName(username)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadProfile()
    }
  }, [userId, user?.name])

  const badge = profile ? getBadge(profile.loginStreak) : null
  // Use pre-calculated avgAccuracy from server, or calculate if not available
  const avgAccuracy = profile?.avgAccuracy || (profile && profile.gamesPlayed > 0 
    ? Math.round(profile.totalAccuracy / profile.gamesPlayed) 
    : 0)

  const handleNameChange = async () => {
    const trimmedName = newName.trim()
    if (!trimmedName) {
      setNameError('Name cannot be empty')
      return
    }

    if (trimmedName === (profile?.username || userId)) {
      setEditingName(false)
      setNameError('')
      return
    }

    setSaving(true)
    setNameError('')

    try {
      // Check if username is available
      const isAvailable = await checkUsernameAvailable(trimmedName)
      
      if (!isAvailable) {
        setNameError('This name is already taken. Choose another!')
        setSaving(false)
        return
      }

      // Update the profile with new username
      const result = await updateUserProfile(userId, { 
        username: trimmedName,
        newUsername: trimmedName
      })
      
      if (result) {
        // Update local storage
        const currentUser = getUser()
        if (currentUser) {
          setUser({ ...currentUser, name: trimmedName })
        }
        
        setProfile(prev => ({ ...prev, username: trimmedName }))
        setEditingName(false)
        setSaveMessage('Name updated successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        
        if (onProfileUpdate) {
          onProfileUpdate({ username: trimmedName })
        }
      } else {
        setNameError('Failed to update name. Try again.')
      }
    } catch (err) {
      console.error('Error updating name:', err)
      setNameError('Failed to update name. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleBioSave = async () => {
    setSaving(true)
    try {
      const result = await updateUserBio(userId, bio)
      if (result) {
        setProfile(prev => ({ ...prev, bio }))
        setSaveMessage('Bio saved!')
        setTimeout(() => setSaveMessage(''), 3000)
        
        if (onProfileUpdate) {
          onProfileUpdate({ bio })
        }
      }
    } catch (err) {
      console.error('Error saving bio:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingName(false)
    setNewName(profile?.username || userId)
    setNameError('')
  }

  if (!userId) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
            {/* Header with Edit */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                {editingName ? (
                  <div>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value)
                        setNameError('')
                      }}
                      className="px-3 py-2 rounded bg-slate-800 border border-blue-500/50 text-white text-lg font-bold w-full"
                      placeholder="Enter new name"
                      autoFocus
                      maxLength={20}
                    />
                    {nameError && (
                      <div style={{ 
                        color: '#ef4444', 
                        fontSize: '0.85rem', 
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ⚠️ {nameError}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button 
                        className="btn primary"
                        onClick={handleNameChange}
                        disabled={saving}
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        {saving ? 'Saving...' : '✓ Save'}
                      </button>
                      <button 
                        className="btn"
                        onClick={handleCancelEdit}
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        ✗ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 className="neon-text" style={{ fontSize: '1.75rem', margin: 0 }}>
                      {profile.username || userId}
                    </h3>
                    <button 
                      onClick={() => setEditingName(true)}
                      className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                      title="Edit name"
                      style={{ border: '1px solid rgba(96, 165, 250, 0.3)' }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                  My Profile
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
                    minWidth: '90px'
                  }}
                >
                  <div style={{ 
                    fontSize: '2rem', 
                    marginBottom: '4px',
                    filter: `drop-shadow(0 0 12px ${badge.color})`,
                    animation: 'badge-float 3s ease-in-out infinite'
                  }}>
                    {badge.emoji}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    color: badge.color,
                    textTransform: 'uppercase'
                  }}>
                    {badge.name}
                  </div>
                </div>
              )}
            </div>

            {/* Success Message */}
            {saveMessage && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '8px',
                padding: '10px 16px',
                marginBottom: '1rem',
                color: '#22c55e',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                ✓ {saveMessage}
              </div>
            )}

            {/* Bio Section - Always Editable */}
            <div style={{
              marginBottom: '1.5rem'
            }}>
              <label style={{ 
                fontSize: '0.85rem', 
                color: '#94a3b8', 
                display: 'block', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                📝 Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600/50 text-white resize-none focus:border-blue-500/50 focus:outline-none transition-colors"
                style={{ minHeight: '100px' }}
                maxLength={200}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {bio.length}/200 characters
                </span>
                <button 
                  className="btn primary"
                  onClick={handleBioSave}
                  disabled={saving}
                  style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                >
                  {saving ? 'Saving...' : 'Save Bio'}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'rgba(96, 165, 250, 0.1)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#60a5fa',
                  textShadow: '0 0 10px #60a5fa'
                }}>
                  {profile.highestScore}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Highest Score
                </div>
              </div>

              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#22c55e',
                  textShadow: '0 0 10px #22c55e'
                }}>
                  {avgAccuracy}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Avg Accuracy
                </div>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#a855f7',
                  textShadow: '0 0 10px #a855f7'
                }}>
                  {profile.totalGames}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Games Played
                </div>
              </div>

              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#fbbf24',
                  textShadow: '0 0 10px #fbbf24'
                }}>
                  {profile.loginStreak}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Login Streak
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn"
                onClick={onClose}
                style={{ minWidth: '100px' }}
              >
                Close
              </button>
              {onBackToDashboard && (
                <button 
                  className="btn primary"
                  onClick={onBackToDashboard}
                  style={{ minWidth: '140px' }}
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

export default MyProfileEditor
