import React, { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GameBoard from '../components/GameBoard.clean.jsx'
import { saveScore, getUser, removeUser } from '../utils/storage.js'
import { postScore } from '../services/api.js'

const GamePage = () => {
  const navigate = useNavigate()
  const [gameOverData, setGameOverData] = useState(null)

  const handleGameOver = useCallback((data) => {
    if (gameOverData) return
    setGameOverData(data)
    // save to local leaderboard
    const user = getUser()
    const username = user?.name || 'Anonymous'
    const userId = user?.id || null

    saveScore(username, data.score)
    // also send to server leaderboard (fire-and-forget)
    try {
      postScore({
        name: username,
        score: data.score,
        accuracy: data.accuracy,
        level: data.level,
        userId: userId
      })
    } catch (e) {
      console.warn('failed to post score', e)
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
    <div className="min-h-screen w-full flex justify-center items-start game-page-wrapper">
      <div className="container game-container">
        <div className="glass-card game-card-wrapper">
          <GameBoard onGameOver={handleGameOver} onExit={() => navigate('/dashboard')} />
        </div>
        {gameOverData && (
          <div className="overlay">
            <div className="card modal">
              <h3>Game Over</h3>
              <p>Score: <strong>{gameOverData.score}</strong></p>
              <p>Accuracy: <strong>{gameOverData.accuracy}%</strong></p>
              <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn primary" onClick={() => window.location.reload()}>Play Again</button>
                <button className="btn" onClick={handleBack}>Back to Dashboard</button>
                <Link to="/leaderboard" className="btn">Leaderboard</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GamePage
