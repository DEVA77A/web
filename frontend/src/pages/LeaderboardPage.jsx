import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/storage.js'

const LeaderboardPage = () => {
	const [scores, setScores] = useState([])

	useEffect(() => {
		setScores(getLeaderboard())
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
						<div className="cta-button">Refresh</div>
					</div>

					{scores.length === 0 ? (
						<div className="muted">No scores yet — play to create the first score!</div>
					) : (
						<div>
							<ol className="leader-list">
								{scores.map((s, i) => (
									<li key={s.username || i} className="leader-row">
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
