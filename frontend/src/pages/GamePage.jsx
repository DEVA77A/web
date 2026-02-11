import React, { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GameBoard from '../components/GameBoard.clean.jsx'
import MyProfileEditor from '../components/MyProfileEditor.jsx'
import { saveScore, getUser, removeUser, updateProfile } from '../utils/storage.js'
import { postScore, updateUserProfile } from '../services/api.js'
import ShowcaseCard from '../components/ui/ShowcaseCard.jsx'
import ShowcaseButton from '../components/ui/ShowcaseButton.jsx'

const GamePage = () => {
  const navigate = useNavigate()
  const [gameOverData, setGameOverData] = useState(null)
  const [showMyProfile, setShowMyProfile] = useState(false)

  const handleGameOver = useCallback((data) => {
    if (gameOverData) return
    setGameOverData(data)
    // save to local leaderboard
    const user = getUser()
    const username = user?.name || 'Anonymous'
    const userId = user?.id || user?.name || null

    saveScore(username, data.score, data.accuracy)
    updateProfile(username, { score: data.score, accuracy: data.accuracy })

    // also send to server leaderboard and profile (fire-and-forget)
    try {
      postScore({
        name: username,
        score: data.score,
        accuracy: data.accuracy,
        level: data.level,
        userId: userId,
        round: data.round
      })

      // Update backend profile
      if (userId) {
        updateUserProfile(userId, {
          score: data.score,
          accuracy: data.accuracy,
          username: username
        })
      }
    } catch (e) {
      console.warn('failed to post score or update profile', e)
    }
  }, [gameOverData])

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleLogout = () => {
    // clear saved user and go to login page
    removeUser()
    navigate('/')
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
      <div className="w-full max-w-5xl">
        <ShowcaseCard className="border-t-4 border-t-cyan-500/50">
          <GameBoard onGameOver={handleGameOver} onExit={() => navigate('/dashboard')} />
        </ShowcaseCard>

        {gameOverData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <ShowcaseCard className="max-w-md w-full animate-[float_4s_ease-in-out_infinite]">
              <div className="text-center">
                <h3 className="text-3xl font-bold uppercase mb-2 text-white">Game Over</h3>
                <div className="text-6xl font-mono font-bold text-cyan-400 mb-2 text-shadow-glow">
                  {gameOverData.score}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-widest mb-8">Final Score</div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Accuracy</div>
                    <div className="text-xl font-bold text-white">{gameOverData.accuracy}%</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Level</div>
                    <div className="text-xl font-bold text-white">{gameOverData.level}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <ShowcaseButton variant="primary" onClick={() => window.location.reload()}>
                    Play Again
                  </ShowcaseButton>
                  <ShowcaseButton variant="secondary" onClick={() => setShowMyProfile(true)}>
                    Edit Profile
                  </ShowcaseButton>
                  <ShowcaseButton variant="ghost" onClick={handleBack}>
                    Back to Dashboard
                  </ShowcaseButton>
                </div>
              </div>
            </ShowcaseCard>
          </div>
        )}
      </div>

      {/* My Profile Editor Modal */}
      {showMyProfile && (
        <MyProfileEditor
          onClose={() => setShowMyProfile(false)}
          onBackToDashboard={handleBack}
        />
      )}
    </div>
  )
}

export default GamePage
