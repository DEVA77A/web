import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { getUser } from '../utils/storage.js'

const LoginPage = () => {
  const navigate = useNavigate()

  // Always start on the login page when opening the site.
  // Previously the app auto-redirected if a user was saved; we keep the login visible so
  // users can choose to switch accounts explicitly.

  return (
    <div className="page-center">
      <div className="container" style={{maxWidth:480}}>
        <div className="glass-card auth-card">
          <LoginForm onLogin={() => navigate('/dashboard')} />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
