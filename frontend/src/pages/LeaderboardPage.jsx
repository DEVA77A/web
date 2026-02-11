import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeaderboard, removeUser, getUser, getProfile, getBadge } from '../utils/storage.js'
import { getTopScores } from '../services/api.js'
import PlayerProfile from '../components/PlayerProfile.jsx'
import OtherPlayerProfileModal from '../components/OtherPlayerProfileModal.jsx'
import MyProfileEditor from '../components/MyProfileEditor.jsx'
import ShowcaseCard from '../components/ui/ShowcaseCard.jsx'
import ShowcaseButton from '../components/ui/ShowcaseButton.jsx'

const LeaderboardPage = () => {
	const [scores, setScores] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedPlayer, setSelectedPlayer] = useState(null)
	const [showMyProfile, setShowMyProfile] = useState(false)
	const navigate = useNavigate()
	const currentUser = getUser()

	const getCrown = (index) => {
		if (index === 0) return <span className="text-xl">👑</span>
		if (index === 1) return <span className="text-xl opacity-80">👑</span>
		if (index === 2) return <span className="text-xl opacity-60">👑</span>
		return null
	}

	const loadScores = async () => {
		setLoading(true)
		try {
			const list = await getTopScores(10)
			if (Array.isArray(list) && list.length > 0) {
				setScores(list.slice(0, 10))
			} else {
				setScores([])
			}
		} catch (err) {
			console.error('Failed to load scores from server:', err)
			setScores([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadScores()

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

	const handlePlayerClick = (playerId) => {
		const currentUserId = currentUser?.id || currentUser?.name
		if (playerId === currentUserId) {
			setShowMyProfile(true)
		} else {
			setSelectedPlayer(playerId)
		}
	}

	const handleBackToDashboard = () => {
		navigate('/dashboard')
	}

	return (
		<div className="container-xl py-20 flex flex-col items-center">
			<div className="w-full max-w-4xl">
				<ShowcaseCard className="mb-8">
					<div className="flex flex-col items-center gap-4 mb-8 border-b border-white/5 pb-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-white/5 rounded-2xl">
								<img src="/logo.png" alt="Type Sprint Logo" className="w-12 h-12" />
							</div>
							<div className="text-center">
								<h2 className="text-3xl font-bold uppercase tracking-tight">
									<span className="text-white">Global</span> <span className="showcase-text-gradient">Leaderboard</span>
								</h2>
								<div className="text-gray-400 text-sm tracking-widest uppercase mt-1">Top Champions — Accuracy & Speed</div>
							</div>
						</div>
						<ShowcaseButton variant="ghost" onClick={loadScores} className="px-6 text-sm">
							🔄 Refresh Scores
						</ShowcaseButton>
					</div>

					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 gap-4">
							<div className="loader-spinner"></div>
							<span className="text-gray-500 uppercase tracking-widest text-sm">Loading Data...</span>
						</div>
					) : scores.length === 0 ? (
						<div className="text-gray-500 text-center p-8 italic">No scores yet — play to create the first score!</div>
					) : (
						<div className="space-y-2">
							{scores.map((s, i) => (
								<div
									key={s._id || i}
									className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
									onClick={() => handlePlayerClick(s.name || s.username)}
								>
									<div className={`
										flex items-center justify-center w-12 h-12 rounded-lg font-bold text-2xl
										${i === 0 ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : ''}
										${i === 1 ? 'bg-gray-400/20 text-gray-300' : ''}
										${i === 2 ? 'bg-orange-700/20 text-orange-400' : ''}
										${i > 2 ? 'text-gray-600' : ''}
									`}>
										{i + 1}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-3">
											{getCrown(i)}
											<span className="font-bold text-lg md:text-xl text-white group-hover:text-cyan-400 transition-colors">
												{s.name || s.username || 'Anonymous'}
											</span>
											{(() => {
												const profile = getProfile(s.name || s.username)
												const badge = profile ? getBadge(profile.loginStreak) : null
												return badge ? <span className="text-base" title={`${badge.name} - ${profile.loginStreak} days`}>{badge.emoji}</span> : null
											})()}
										</div>
									</div>

									<div className="text-right flex flex-col items-end">
										<div className="font-mono text-2xl md:text-3xl font-bold text-cyan-400 tracking-wider">
											{s.score}
										</div>
										<div className="flex gap-4 text-xs text-gray-500 uppercase tracking-wider">
											<span>Acc: {s.accuracy || 0}%</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					<p className="text-center text-gray-600 text-xs uppercase tracking-widest mt-8">
						Click on a player name to view their profile details
					</p>
				</ShowcaseCard>
			</div>

			{/* Other Player Profile Modal */}
			{selectedPlayer && (
				<OtherPlayerProfileModal
					userId={selectedPlayer}
					onClose={() => setSelectedPlayer(null)}
					onBackToDashboard={handleBackToDashboard}
				/>
			)}

			{/* My Profile Editor Modal */}
			{showMyProfile && (
				<MyProfileEditor
					onClose={() => setShowMyProfile(false)}
					onBackToDashboard={handleBackToDashboard}
				/>
			)}
		</div>
	)
}

export default LeaderboardPage
