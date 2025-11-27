import React, { useState } from 'react'
import { setUser } from '../utils/storage.js'

const LoginForm = ({ onLogin = () => {} }) => {
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const clean = (name || '').trim() || `Player${Math.floor(Math.random() * 900 + 100)}`
    setUser(clean)
    onLogin(clean)
  }

  return (
    <form className="login-form glass-card auth-card" onSubmit={submit}>
      <div className="login-header">
        <div className="logo-badge">FF</div>
        <div>
          <div className="hero-title gtahero">FingerFury</div>
          <div className="hero-sub">Fastest fingers win — join the sprint</div>
        </div>
      </div>

      <div>
        <label className="label">Player name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a display name" />
      </div>

      <div>
        <label className="label">Password (optional)</label>
        <input className="input" type="password" placeholder="Not required" />
      </div>

      <div className="actions">
        <button className="btn primary btn large" type="submit">Enter the Arena</button>
      </div>
    </form>
  )
}

export default LoginForm
