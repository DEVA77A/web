import React, { useState, useEffect } from 'react'
import { getPlayerStats } from '../services/api.js'
import { getBadge } from '../utils/storage.js'
import ShowcaseCard from './ui/ShowcaseCard.jsx'
import ShowcaseButton from './ui/ShowcaseButton.jsx'

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
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </ShowcaseCard>
        ) : profile ? (
          <ShowcaseCard className="border-t-4 border-t-cyan-500/50">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-4xl font-bold uppercase tracking-wider mb-2">
                  <span className="showcase-text-gradient">{profile.username || userId}</span>
                </h2>
                <p className="text-gray-500 text-sm uppercase tracking-widest">Player Profile</p>
              </div>
              {badge && (
                <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-5xl mb-2 animate-pulse">
                    {badge.emoji}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: badge.color }}>
                    {badge.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{profile.loginStreak} days</div>
                </div>
              )}
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="mb-8 p-4 bg-cyan-500/5 border-l-4 border-l-cyan-500 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Bio</div>
                <p className="text-gray-300 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

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

export default OtherPlayerProfileModal
