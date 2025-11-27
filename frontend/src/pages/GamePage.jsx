import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GameBoard from '../components/GameBoard.clean.jsx'
import { saveScore, getUser, removeUser } from '../utils/storage.js'
import { postScore } from '../services/api.js'

const GamePage = () => {
  const [gameOverData, setGameOverData] = useState(null)

  const handleGameOver = (data) => {
    setGameOverData(data)
    // save to local leaderboard
    const user = getUser() || 'Anonymous'
    saveScore(user, data.score)
    // also send to server leaderboard (fire-and-forget)
    try {
      postScore({ name: user, score: data.score, accuracy: data.accuracy, level: data.level })
    } catch (e) {
      console.warn('failed to post score', e)
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleLogout = () => {
    // clear saved user and go to login page
    removeUser()
    navigate('/')
  }

  return (
    <div className="page-center">
      <div className="container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 className="hero-title gtahero">TypeSprint — Play</h2>
          <div style={{display:'flex',gap:12}}>
            <button className="btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="btn" onClick={handleLogout}>Change Account</button>
          </div>
        </div>
        <div className="glass-card">
          <GameBoard onGameOver={handleGameOver} />
        </div>
      </div>
      {gameOverData && (
        <div className="overlay">
          <div className="card modal">
            <h3>Game Over</h3>
            <p>Score: <strong>{gameOverData.score}</strong></p>
            <p>Accuracy: <strong>{gameOverData.accuracy}%</strong></p>
            <div className="mt-4">
              <button className="btn primary" onClick={() => window.location.reload()}>Play Again</button>
              <button className="btn" onClick={handleBack} style={{ marginLeft: 12 }}>Back to Dashboard</button>
              <Link to="/leaderboard" className="btn" style={{ marginLeft: 12 }}>Leaderboard</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamePage
