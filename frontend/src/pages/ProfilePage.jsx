import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, getProfile, getBadge, removeUser } from '../utils/storage.js'
import { getUserProfile } from '../services/api.js'
import ShowcaseCard from '../components/ui/ShowcaseCard.jsx'
import ShowcaseButton from '../components/ui/ShowcaseButton.jsx'

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

  const displayName = profile?.username || username

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const backendProfile = await getUserProfile(userId)
        if (backendProfile) {
          setProfile(backendProfile)
        } else {
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
    <div className="container-xl py-20 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <ShowcaseCard className="relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center gap-6 mb-12 border-b border-white/5 pb-8 relative z-10">
            {/* Badge in top-right corner */}
            {badge && (
              <div className="absolute top-0 right-0 text-center px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-4xl mb-1 animate-pulse">
                  {badge.emoji}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: badge.color }}>
                  {badge.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">{profile.loginStreak} days</div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-1 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <div className="bg-black/80 p-4 rounded-xl">
                  <img src="/logo.png" alt="Logo" className="w-16 h-16" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
                  <span className="showcase-text-gradient">{displayName}</span>
                </h1>
                <div className="text-gray-400 tracking-[0.2em] uppercase text-sm">Type Sprint Champion</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="loader-spinner"></div>
              <span className="text-gray-500 uppercase tracking-widest text-sm">Syncing Profile...</span>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatBox label="Highest Score" value={profile.highestScore} icon="🏆" color="text-yellow-400" />
                <StatBox label="Avg Accuracy" value={`${avgAccuracy}%`} icon="🎯" color="text-cyan-400" />
                <StatBox label="Games Played" value={profile.totalGames} icon="🎮" color="text-purple-400" />
                <StatBox label="Login Streak" value={profile.loginStreak} icon="🔥" color="text-orange-400" />
              </div>

              {/* Progress Bar / Next Rank */}
              <div className="bg-black/40 rounded-xl p-8 border border-white/5 text-center">
                {profile.loginStreak < 1000 ? (
                  <div>
                    {GetNextRankProgress(profile.loginStreak)}
                  </div>
                ) : (
                  <div className="text-yellow-400 font-bold text-xl uppercase tracking-widest animate-pulse">
                    🏆 Grand Master Status Achieved 🏆
                  </div>
                )}
              </div>
            </div>
          )}
        </ShowcaseCard>
      </div>
    </div>
  )
}

const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-white/5 border border-white/5 p-6 rounded-xl hover:bg-white/10 hover:border-white/10 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className="text-gray-500 text-xs uppercase tracking-widest font-bold">{label}</div>
      <div className="text-2xl grayscale group-hover:grayscale-0 transition-all">{icon}</div>
    </div>
    <div className={`text-3xl font-bold font-mono ${color}`}>
      {value}
    </div>
  </div>
)

const GetNextRankProgress = (streak) => {
  let target = 7;
  let rank = "Rising Star";
  let icon = "✨";
  let remaining = 0;

  if (streak >= 500) { target = 1000; rank = "Grand Master"; icon = "👑"; }
  else if (streak >= 100) { target = 500; rank = "Legendary"; icon = "⭐"; }
  else if (streak >= 30) { target = 100; rank = "Elite"; icon = "💎"; }
  else if (streak >= 7) { target = 30; rank = "Veteran"; icon = "🔥"; }

  remaining = target - streak;
  const progress = Math.min(100, (streak / target) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between text-sm text-gray-400 uppercase tracking-widest mb-4">
        <span>Current Progress</span>
        <span className="text-cyan-400 font-bold">{streak} / {target} Days</span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-6 relative">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-lg">
        <span className="font-bold text-white">{remaining}</span> days until <span className="font-bold text-cyan-400">{rank}</span> {icon}
      </div>
    </div>
  )
}


export default ProfilePage
