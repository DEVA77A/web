import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { getUser } from '../utils/storage.js'
import '../styles/Animations.css'

const LoginPage = () => {
  const navigate = useNavigate()

  // Always start on the login page when opening the site.
  // Previously the app auto-redirected if a user was saved; we keep the login visible so
  // users can choose to switch accounts explicitly.

  return (
    <>
      <div className="cyber-grid"></div>
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
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
        <div className="container" style={{maxWidth:480}}>
        <div className="glass-card auth-card">
          <LoginForm onLogin={() => navigate('/dashboard')} />
        </div>
      </div>
      </div>
    </>
  )
}

export default LoginPage
