import React, { useState } from 'react'
import { setUser } from '../utils/storage.js'
import { loginUser } from '../services/api.js'

const LoginForm = ({ onLogin = () => { } }) => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const cleanName = (name || '').trim()
    const cleanPass = (password || '').trim()

    if (!cleanName || !cleanPass) {
      setError('Username and password are required')
      return
    }

    try {
      const user = await loginUser(cleanName, cleanPass)
      setUser(user)
      onLogin(user)
    } catch (err) {
      console.warn('Login failed', err)
      setError(err.message || 'Login failed. Check your credentials.')
    }
  }

  return (
    <form className="login-form glass-card auth-card" onSubmit={submit}>
      <div className="login-header">
        <div className="logo-badge">TS</div>
        <div>
          <div className="hero-title gtahero">Type Sprint</div>
          <div className="hero-sub">Fastest fingers win — join the sprint</div>
        </div>
      </div>

      {error && <div style={{ color: '#ff4444', marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <div>
        <label className="label">Player name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a display name" required />
      </div>

      <div>
        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Required to play" required />
      </div>

      <div className="actions">
        <button className="btn primary btn large" type="submit">Enter the Arena</button>
      </div>
    </form>
  )
}

export default LoginForm
