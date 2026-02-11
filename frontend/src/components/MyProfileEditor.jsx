import React, { useState, useEffect } from 'react'
import { getUser, getBadge, setUser } from '../utils/storage.js'
import { getPlayerStats, updateUserProfile, checkUsernameAvailable, updateUserBio } from '../services/api.js'
import ShowcaseCard from './ui/ShowcaseCard.jsx'
import ShowcaseButton from './ui/ShowcaseButton.jsx'

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
      const isAvailable = await checkUsernameAvailable(trimmedName)

      if (!isAvailable) {
        setNameError('This name is already taken. Choose another!')
        setSaving(false)
        return
      }

      const result = await updateUserProfile(userId, {
        username: trimmedName,
        newUsername: trimmedName
      })

      if (result) {
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
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <ShowcaseCard>
            <div className="p-12 text-center">
              <div className="loader-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </ShowcaseCard>
        ) : profile ? (
          <ShowcaseCard className="border-t-4 border-t-cyan-500/50">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/5">
              <div className="flex-1 mr-4">
                {editingName ? (
                  <div className="animate-fade-in">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value)
                        setNameError('')
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/50 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 mb-2"
                      placeholder="Enter new name"
                      autoFocus
                      maxLength={20}
                    />
                    {nameError && (
                      <div className="text-red-400 text-sm mb-2 flex items-center gap-1">
                        ⚠️ {nameError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <ShowcaseButton
                        variant="primary"
                        onClick={handleNameChange}
                        disabled={saving}
                        className="py-1 px-4 text-xs min-w-[80px] h-8"
                      >
                        {saving ? '...' : '✓ Save'}
                      </ShowcaseButton>
                      <ShowcaseButton
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="py-1 px-4 text-xs min-w-[80px] h-8"
                      >
                        ✗ Cancel
                      </ShowcaseButton>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-bold uppercase tracking-wider">
                        <span className="showcase-text-gradient">{profile.username || userId}</span>
                      </h2>
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/30"
                        title="Edit name"
                      >
                        ✏️
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm uppercase tracking-widest">My Profile</p>
                  </div>
                )}
              </div>

              {badge && (
                <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-5xl mb-2 animate-pulse">
                    {badge.emoji}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: badge.color }}>
                    {badge.name}
                  </div>
                </div>
              )}
            </div>

            {/* Success Message */}
            {saveMessage && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center text-sm font-bold tracking-wide animate-fade-in">
                ✓ {saveMessage}
              </div>
            )}

            {/* Bio Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">BIO</span>
                </div>
              </div>

              <div className="relative group p-3 bg-cyan-500/5 border-l-4 border-l-cyan-500 rounded-r-lg hover:bg-cyan-500/10 transition-colors">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  className="w-full bg-transparent text-gray-300 leading-relaxed border-none focus:ring-0 resize-none p-0 text-sm placeholder-gray-600 focus:outline-none"
                  style={{ minHeight: '60px' }}
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-cyan-500/20">
                  <span className="text-xs text-gray-600">
                    {bio.length}/200 characters
                  </span>
                  <button
                    onClick={handleBioSave}
                    disabled={saving}
                    className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Bio'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl text-center group hover:border-cyan-500/40 transition-all">
                <div className="text-4xl font-bold text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                  {profile.highestScore}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                  Highest Score
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-2xl text-center group hover:border-green-500/40 transition-all">
                <div className="text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform">
                  {avgAccuracy}%
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                  Avg Accuracy
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-2xl text-center group hover:border-purple-500/40 transition-all">
                <div className="text-4xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                  {profile.totalGames}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                  Games Played
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/20 rounded-2xl text-center group hover:border-yellow-500/40 transition-all">
                <div className="text-4xl font-bold text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
                  {profile.loginStreak}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                  Login Streak
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center pt-6 border-t border-white/5">
              <ShowcaseButton onClick={onClose} variant="ghost">
                Close
              </ShowcaseButton>
              {onBackToDashboard && (
                <ShowcaseButton onClick={onBackToDashboard} variant="primary">
                  🏠 Dashboard
                </ShowcaseButton>
              )}
            </div>
          </ShowcaseCard>
        ) : (
          <ShowcaseCard>
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">Could not load profile</p>
              <ShowcaseButton onClick={onClose} variant="ghost">Close</ShowcaseButton>
            </div>
          </ShowcaseCard>
        )}
      </div>
    </div>
  )
}

export default MyProfileEditor
