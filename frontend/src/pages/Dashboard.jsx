import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getLeaderboard } from '../utils/storage.js'

const Dashboard = () => {
  const user = getUser() || 'Player'
  const navigate = useNavigate()
  const top = getLeaderboard().slice(0, 5)

  return (
    <div className="page-center">
      <div className="container grid md:grid-cols-2 gap-6">
        <div>
          <div className="glass-card">
            <h2 className="hero-title gtahero">Welcome, {user}</h2>
            <p className="muted">Type words before they hit the ground. Score points, survive lives, climb the leaderboard.</p>
            <div className="mt-6">
              <button className="btn primary large" onClick={() => navigate('/game')}>Start Game</button>
              <button className="btn" onClick={() => navigate('/leaderboard')} style={{ marginLeft: 12 }}>Leaderboard</button>
            </div>
          </div>
        </div>

        <aside>
          <div className="glass-card">
            <h3 className="mb-3">Top Players</h3>
            {top.length === 0 ? (
              <div className="muted">No scores yet — play to be first!</div>
            ) : (
              <ol className="leader-list">
                {top.map((p, i) => (
                  <li key={p.username || i} className="leader-row"><div className="leader-rank">{i+1}</div><div className="leader-name">{p.username}</div><div className="leader-score">{p.score}</div></li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
