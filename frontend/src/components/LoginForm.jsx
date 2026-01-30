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
      // Show user-friendly error messages
      const errorMsg = err.message || 'Login failed. Please try again.'
      if (errorMsg.includes('already taken') || errorMsg.includes('Username already')) {
        setError('⚠️ Username already taken. Please choose a different name.')
      } else if (errorMsg.includes('Incorrect password')) {
        setError('🔒 Incorrect password. Please try again.')
      } else {
        setError(errorMsg)
      }
    }
  }

  return (
    <form className="login-form glass-card auth-card teal-glow" onSubmit={submit} style={{ padding: '1.5rem 2.25rem' }}>
      <div className="login-header" style={{ flexDirection: 'column', gap: 16, alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ background: '#000', padding: '1rem 2rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '240px', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)' }}>
          <img src="/logo.png" alt="Type Sprint Logo" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 8px rgba(0,255,255,0.3))' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="hero-sub" style={{ fontSize: '0.9rem', opacity: 0.85 }}>Fastest fingers win — join the sprint</div>
        </div>
      </div>

      {error && <div style={{ color: '#ff4444', marginBottom: 10, fontSize: 13, textAlign: 'center' }}>{error}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>Player name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a display name" required style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem' }} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="label" style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Required to play" required style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem' }} />
      </div>

      <div className="actions" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
        <button className="btn primary large" type="submit" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Enter the Arena</button>
      </div>
    </form>
  )
}

export default LoginForm
