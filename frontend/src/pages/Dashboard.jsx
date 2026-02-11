import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getProfile, getBadge } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'
import PlayerProfile from '../components/PlayerProfile.jsx'
import OtherPlayerProfileModal from '../components/OtherPlayerProfileModal.jsx'
import MyProfileEditor from '../components/MyProfileEditor.jsx'
import ShowcaseCard from '../components/ui/ShowcaseCard.jsx'
import ShowcaseButton from '../components/ui/ShowcaseButton.jsx'
import gsap from 'gsap'

const Dashboard = () => {
  const user = getUser() || 'Player'
  const navigate = useNavigate()
  const [top, setTop] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showMyProfile, setShowMyProfile] = useState(false)

  const heroRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    // Entrance Animations
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });

      gsap.from(listRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.4
      });
    });

    return () => ctx.revert();
  }, []);

  const getCrown = (index) => {
    if (index === 0) return <span className="text-xl">👑</span>
    if (index === 1) return <span className="text-xl opacity-80">👑</span>
    if (index === 2) return <span className="text-xl opacity-60">👑</span>
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
        if (Array.isArray(list) && list.length > 0) {
          setTop(list.slice(0, 3))
        } else {
          setTop([])
        }
      } catch (err) {
        console.error('Failed to load top scores:', err)
        setTop([])
      } finally {
        setLoading(false)
      }
    }

    loadTopScores()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTopScores()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
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
    <div className="container-xl py-12 flex-1 flex flex-col justify-center">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Col: Hero */}
        <div ref={heroRef}>
          <ShowcaseCard className="border-l-4 border-l-cyan-400">
            <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter uppercase">
              <span className="text-white">Type </span>
              <span className="showcase-text-gradient">Sprint</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
              Master the keyboard. Survive the falling words. Climb the ranks in the ultimate typing challenge.
            </p>

            <div className="flex flex-wrap gap-4">
              <ShowcaseButton onClick={() => navigate('/game')} variant="primary" className="min-w-[160px]">
                Start Game
              </ShowcaseButton>
              <ShowcaseButton onClick={() => setShowMyProfile(true)} variant="secondary">
                Profile
              </ShowcaseButton>
              <ShowcaseButton onClick={() => navigate('/leaderboard')} variant="ghost">
                Leaderboard
              </ShowcaseButton>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => { localStorage.removeItem('typesprint_user'); navigate('/'); }}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
              >
                Log Out
              </button>
            </div>
          </ShowcaseCard>
        </div>

        {/* Right Col: Top Players */}
        <div ref={listRef}>
          <ShowcaseCard title="Top Players">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="loader-spinner"></div>
              </div>
            ) : top.length === 0 ? (
              <div className="text-gray-500 italic p-4">No data available yet.</div>
            ) : (
              <div className="space-y-3">
                {top.map((p, i) => (
                  <div
                    key={p._id || i}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                    onClick={() => handlePlayerClick(p.username || p.name)}
                  >
                    <div className={`
                        flex items-center justify-center w-10 h-10 rounded-lg font-bold text-xl
                        ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${i === 1 ? 'bg-gray-400/20 text-gray-300' : ''}
                        ${i === 2 ? 'bg-orange-700/20 text-orange-400' : ''}
                      `}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getCrown(i)}
                        <span className="font-bold text-lg truncate group-hover:text-cyan-400 transition-colors">
                          {p.username || p.name || 'Anonymous'}
                        </span>
                        {(() => {
                          const profile = getProfile(p.username || p.name)
                          const badge = profile ? getBadge(profile.loginStreak) : null
                          return badge ? (
                            <span className="text-sm" title={`${badge.name} - ${profile.loginStreak} days`}>
                              {badge.emoji}
                            </span>
                          ) : null
                        })()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-2xl font-bold text-cyan-400 tracking-wider">
                        {p.score}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-sm text-cyan-500 hover:text-cyan-300 transition-colors uppercase font-bold tracking-widest"
              >
                View All Rankings →
              </button>
            </div>
          </ShowcaseCard>
        </div>
      </div>

      {/* Modals */}
      {selectedPlayer && (
        <OtherPlayerProfileModal
          userId={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onBackToDashboard={() => setSelectedPlayer(null)}
        />
      )}

      {showMyProfile && (
        <MyProfileEditor
          onClose={() => setShowMyProfile(false)}
          onBackToDashboard={() => setShowMyProfile(false)}
        />
      )}
    </div>
  )
}

export default Dashboard
