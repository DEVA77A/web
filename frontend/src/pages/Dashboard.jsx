import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getLeaderboard } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'

const Dashboard = () => {
  const user = getUser() || 'Player'
  const navigate = useNavigate()
  const [top, setTop] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getTopScores(3)
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setTop(list.slice(0, 3))
        } else {
          // Fallback to local
          const local = getLeaderboard().slice(0, 3).map(s => ({ _id: s.username, username: s.username, score: s.score }))
          setTop(local)
        }
      })
      .catch(() => {
        const local = getLeaderboard().slice(0, 3).map(s => ({ _id: s.username, username: s.username, score: s.score }))
        setTop(local)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-center" style={{ paddingTop: '20px' }}>
      <div className="container grid md:grid-cols-2 gap-6">
        <div>
          <div className="glass-card">
            <h2 className="hero-title gtahero">Welcome, {user?.name || user}</h2>
            <p className="muted">Type words before they hit the ground. Score points, survive lives, climb the leaderboard.</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <button className="btn primary large" onClick={() => navigate('/game')}>Start Game</button>
              <button className="btn" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
              <button className="btn" onClick={() => { localStorage.removeItem('typesprint_user'); navigate('/'); }}>Logout</button>
            </div>
          </div>
        </div>

        <aside>
          <div className="glass-card">
            <h3 className="mb-3">Top Players</h3>
            {loading ? (
              <div className="muted">Loading top scores...</div>
            ) : top.length === 0 ? (
              <div className="muted">No scores yet — play to be first!</div>
            ) : (
              <ol className="leader-list">
                {top.map((p, i) => (
                  <li key={p._id || i} className="leader-row">
                    <div className="leader-rank">{i + 1}</div>
                    <div className="leader-name">{p.username || p.name || 'Anonymous'}</div>
                    <div className="leader-score">{p.score}</div>
                  </li>
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
