import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeaderboard, removeUser } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'
import PlayerProfile from '../components/PlayerProfile.jsx'
import '../styles/Animations.css'

const LeaderboardPage = () => {
	const [scores, setScores] = useState([])
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const getCrown = (index) => {
		if (index === 0) return <span className="crown-icon crown-gold">👑</span>
		if (index === 1) return <span className="crown-icon crown-silver">👑</span>
		if (index === 2) return <span className="crown-icon crown-bronze">👑</span>
		return null
	}

	const loadScores = async () => {
		setLoading(true)
		try {
			const list = await getTopScores(10)
			console.log('Leaderboard received:', list)
			if (Array.isArray(list) && list.length > 0) {
				// Always use server scores - show all users
				setScores(list.slice(0, 10))
			} else {
				// If server returns empty, show empty (don't use localStorage)
				console.warn('No scores from server')
				setScores([])
			}
		} catch (err) {
			console.error('Failed to load scores from server:', err)
			// On error, try again or show empty - don't use localStorage
			setScores([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadScores()
		
		// Refresh leaderboard when page becomes visible
		const handleVisibilityChange = () => {
			if (!document.hidden) {
				loadScores()
			}
		}
		
		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
	}, [])

	const handleBackToLogin = () => {
		removeUser()
		navigate('/')
	}

	return (
		<>
			<div className="cyber-grid"></div>
			<div className="particles-bg">
				{[...Array(20)].map((_, i) => (
					<div 
						key={i} 
						className="particle" 
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 8}s`,
							animationDuration: `${8 + Math.random() * 4}s`
						}}
					/>
				))}
			</div>
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
					<div className="muted" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', padding: '2rem' }}>
						<div className="loading-spinner"></div>
						<span>Loading leaderboard…</span>
					</div>
					) : scores.length === 0 ? (
						<div className="muted">No scores yet — play to create the first score!</div>
					) : (
						<div>
							<ol className="leader-list">
								{scores.map((s, i) => (
								<li key={s._id || i} className={`leader-row rank-${i + 1}`} style={{ '--index': i }}>
									<div className="leader-rank">{i + 1}</div>
									<div className="leader-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										{getCrown(i)}
										<PlayerProfile userId={s.name || s.username || 'Anonymous'} compact={true} />
									</div>
									<div className="leader-score score-animate">{s.score}</div>
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
		</>
	)
}

export default LeaderboardPage
