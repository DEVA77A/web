import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import GamePage from './pages/GamePage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import NavBar from './components/NavBar.jsx'
import './index.css'

// Top-level app: routing wrapped with site chrome (nav + theme)
const App = () => {
  return (
    <div className="theme-gtanight">
      <NavBar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
