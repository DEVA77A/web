import React, { useState } from 'react'
import { setUser } from '../utils/storage.js'
import { loginUser } from '../services/api.js'
import ShowcaseButton from './ui/ShowcaseButton.jsx'

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
    <form onSubmit={submit} className="space-y-6">
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative bg-black/90 p-6 rounded-2xl border border-cyan-500/30">
            <img
              src="/logo.png"
              alt="Type Sprint Logo"
              className="w-48 h-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm tracking-[0.2em] uppercase">Fastest fingers win — join the sprint</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">
            Player name
          </label>
          <input
            className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a display name"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">
            Password
          </label>
          <input
            className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Required to play"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <ShowcaseButton
          type="submit"
          variant="primary"
          className="w-full py-4 text-lg font-bold"
        >
          Enter the Arena
        </ShowcaseButton>
      </div>
    </form>
  )
}

export default LoginForm
