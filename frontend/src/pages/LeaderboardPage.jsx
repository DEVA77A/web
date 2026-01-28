import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeaderboard, removeUser } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'

const LeaderboardPage = () => {
	const [scores, setScores] = useState([])
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const loadScores = () => {
		setLoading(true)
		getTopScores(10).then((list) => {
			if (Array.isArray(list) && list.length > 0) {
				setScores(list.slice(0, 10))
			} else {
				const local = getLeaderboard().slice(0, 10).map(s => ({ _id: s.username, name: s.username, score: s.score, accuracy: 0 }))
				setScores(local)
			}
		}).catch(() => {
			const local = getLeaderboard().slice(0, 10).map(s => ({ _id: s.username, name: s.username, score: s.score, accuracy: 0 }))
			setScores(local)
		}).finally(() => setLoading(false))
	}

	useEffect(() => {
		loadScores()
	}, [])

	const handleBackToLogin = () => {
		removeUser()
		navigate('/')
	}

	return (
		<div className="page-center">
			<div className="container">
				<div className="glass-card">
					<div className="leaderboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
							<img src="/logo.png" alt="Type Sprint Logo" style={{ width: 56, height: 'auto' }} />
							<div>
								<h2 className="hero-title gtahero" style={{ margin: 0 }}>Leaderboard</h2>
								<div className="hero-sub">Top sprint champions — accuracy & speed</div>
							</div>
						</div>
						<div style={{ display: 'flex', gap: 12 }}>
							<button className="btn" onClick={loadScores}>Refresh</button>
							<button className="btn" onClick={handleBackToLogin}>Back to Login</button>
						</div>
					</div>

					{loading ? (
						<div className="muted">Loading leaderboard…</div>
					) : scores.length === 0 ? (
						<div className="muted">No scores yet — play to create the first score!</div>
					) : (
						<div>
							<ol className="leader-list">
								{scores.map((s, i) => (
									<li key={s._id || i} className="leader-row">
										<div className="leader-rank">{i + 1}</div>
										<div className="leader-name">{s.name || s.username || 'Anonymous'}</div>
										<div className="leader-score">{s.score}</div>
									</li>
								))}
							</ol>
						</div>
					)}
					<div className="mt-6" style={{ textAlign: 'center' }}>
						<Link to="/dashboard" className="btn primary">Go to Dashboard</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LeaderboardPage
