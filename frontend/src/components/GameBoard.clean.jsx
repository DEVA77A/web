import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FallingWord from './FallingWord2.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import { getWords } from '../services/api.js'
import useSounds from '../hooks/useSounds.js'

// Clean GameBoard implementation used while the original file is repaired
const randX = () => Math.max(16, Math.floor(Math.random() * (Math.max((typeof window !== 'undefined' ? window.innerWidth : 800) - 160, 200))))

const GameBoard = ({ onGameOver = () => {} }) => {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timer, setTimer] = useState(60)
  const [active, setActive] = useState([]) // {id, text, duration, x}
  const [input, setInput] = useState('')
  const totalTypedRef = useRef(0)
  const correctTypedRef = useRef(0)
  const streakRef = useRef(0)
  const spawnRef = useRef(null)
  const [message, setMessage] = useState('')
  const { playHit, playMiss, playLevel } = useSounds()

  // control fall speed and spawn frequency
  // slow base duration so words fall slower for readability; level still speeds slightly
  const speedByLevel = useMemo(() => Math.max(3.6 - level * 0.08, 1.8), [level])
  // spawn interval: keep a comfortable gap between words
  const densityMs = useMemo(() => Math.max(2200 - level * 120, 900), [level])
  const spawnCooldownRef = useRef(false)
  const gameAreaRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (timer <= 0 || misses >= 3) {
      onGameOver({ score, accuracy: Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100), level })
    }
  }, [timer, misses, onGameOver, score, level])

  // spawn a single word at a time. If one is already active or we're in cooldown, skip spawning until ready.
  const spawn = useCallback(async () => {
    // only one word at a time and respect a short cooldown
    if (active.length > 0 || spawnCooldownRef.current) return

    // compute a safe X inside the game area so words don't spawn off-screen
    let areaWidth = null
    try {
      const el = gameAreaRef.current || document.querySelector('.game-area')
      if (el) {
        const r = el.getBoundingClientRect()
        areaWidth = Math.max(120, Math.floor(r.width))
      }
    } catch (e) {
      areaWidth = null
    }

    const pickX = () => {
      if (!areaWidth) return randX()
      const pad = 12
      const max = Math.max(120, areaWidth - pad * 2)
      return Math.floor(pad + Math.random() * max)
    }

    try {
      const words = await getWords({ count: 1, level })
      if (!words || !words.length) throw new Error('no words')
      const w = words[0]
      setActive((cur) => {
        if (cur.length > 0) return cur
        return [
          ...cur,
          { id: crypto.randomUUID(), text: w.text, duration: Math.max(2.6, speedByLevel + Math.random() * 1.2), x: pickX() }
        ]
      })
    } catch (e) {
      const fallback = ['neon', 'cyber', 'react', 'atomic', 'plasma']
      const text = fallback[Math.floor(Math.random() * fallback.length)]
      setActive((cur) => {
        if (cur.length > 0) return cur
        return [
          ...cur,
          { id: crypto.randomUUID(), text, duration: Math.max(2.6, speedByLevel + Math.random() * 1.2), x: pickX() }
        ]
      })
    }
  }, [level, speedByLevel, active.length])

  useEffect(() => {
    spawn()
    spawnRef.current = setInterval(() => spawn(), densityMs)
    return () => clearInterval(spawnRef.current)
  }, [spawn, densityMs])

  const handleComplete = useCallback((id) => {
    setActive((arr) => arr.filter((w) => w.id !== id))
    setMisses((m) => m + 1)
    streakRef.current = 0
    playMiss()
    setMessage('😵 Too Slow!')
    setTimeout(() => setMessage(''), 1200)
    // short cooldown before next spawn to avoid immediate respawn
    spawnCooldownRef.current = true
    setTimeout(() => (spawnCooldownRef.current = false), Math.max(900, Math.floor(densityMs / 2)))
  }, [playMiss, densityMs])

  const handleChange = (e) => setInput(e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = input.trim()
    if (!val) return
    totalTypedRef.current += 1
    const match = active.find((w) => w.text.toLowerCase() === val.toLowerCase())
    if (match) {
      setActive((arr) => arr.filter((w) => w.id !== match.id))
      setScore((s) => {
        const next = s + 10 * level
        if (next % 100 === 0) setLevel((lv) => lv + 1)
        return next
      })
      correctTypedRef.current += 1
      streakRef.current += 1
      playHit()
      if (streakRef.current >= 5) {
        setMessage("🔥 You're on Fire!")
        setTimeout(() => setMessage(''), 1500)
      }
    } else {
      setMisses((m) => m + 1)
      streakRef.current = 0
      playMiss()
      setMessage('❌ Wrong!')
      setTimeout(() => setMessage(''), 900)
    }
    setInput('')
  }

  useEffect(() => {
    if (level > 1) {
      playLevel()
      setMessage(`Level ${level} — Speed Up!`)
      const t = setTimeout(() => setMessage(''), 1200)
      return () => clearTimeout(t)
    }
  }, [level, playLevel])

  return (
    <div ref={gameAreaRef} className="relative w-full h-[75vh] overflow-hidden rounded-xl border bg-card p-4 game-area" style={{ minHeight: 600 }}>
      {active.map((w) => (
        <FallingWord key={w.id} {...w} onComplete={handleComplete} />
      ))}

      {message && (
        <div className="absolute left-1/2 -translate-x-1/2 top-12 px-4 py-2 rounded-lg bg-black/40 border neon-blue text-white">{message}</div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t" style={{ backdropFilter: 'blur(4px)' }}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleChange}
            placeholder="Type a falling word and hit Enter"
            className="flex-1 px-4 py-3 rounded bg-transparent border text-white"
            autoFocus
          />
          <button className="px-4 py-3 rounded bg-neon-blue/20">Enter</button>
        </form>
      </div>

      <ScoreBoard score={score} accuracy={Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100)} level={level} timer={timer} misses={misses} />
    </div>
  )
}

export default GameBoard
