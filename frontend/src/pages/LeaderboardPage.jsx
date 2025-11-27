import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'

const LeaderboardPage = () => {
	const [scores, setScores] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		// try to load server leaderboard first, fall back to localStorage
		let mounted = true
		setLoading(true)
		getTopScores(10).then((list) => {
			if (!mounted) return
			if (Array.isArray(list) && list.length > 0) {
				// backend uses `name`, map to `username` for compatibility
				setScores(list.slice(0, 10).map((s) => ({ username: s.name || s.username || 'Anonymous', score: s.score || 0, accuracy: s.accuracy || 0 })))
			} else {
				setScores(getLeaderboard().slice(0, 10))
			}
		}).catch(() => {
			if (!mounted) return
			setScores(getLeaderboard().slice(0, 10))
		}).finally(() => mounted && setLoading(false))

		return () => { mounted = false }
	}, [])

	return (
		<div className="page-center">
			<div className="container">
				<div className="glass-card">
					<div className="leaderboard-hero">
						<div>
							<h2 className="hero-title gtahero">Leaderboard</h2>
							<div className="hero-sub">Top sprint champions — accuracy & speed</div>
						</div>
						<div className="cta-button">
							<button
								className="w-full h-full"
								onClick={async () => {
									setLoading(true)
									try {
										const list = await getTopScores(10)
										if (Array.isArray(list)) {
											setScores(list.slice(0, 10).map((s) => ({ username: s.name || s.username || 'Anonymous', score: s.score || 0, accuracy: s.accuracy || 0 })))
										}
									} catch (e) {
										setScores(getLeaderboard().slice(0, 10))
									} finally { setLoading(false) }
								}}
							>Refresh</button>
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
									<li key={s.username || s._id || i} className="leader-row">
										<div className="leader-rank">{i + 1}</div>
										<div className="leader-name">{s.username}</div>
										<div className="leader-score">{s.score}</div>
									</li>
								))}
							</ol>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default LeaderboardPage
