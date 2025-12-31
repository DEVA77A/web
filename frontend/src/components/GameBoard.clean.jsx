import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FallingWord from './FallingWord2.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import { getWords } from '../services/api.js'
import useSounds from '../hooks/useSounds.js'

// Clean GameBoard implementation used while the original file is repaired
const randX = () => Math.max(16, Math.floor(Math.random() * (Math.max((typeof window !== 'undefined' ? window.innerWidth : 800) - 160, 200))))

const makeId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch (e) {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const getPrefixMatchInfo = (typedRaw, targetRaw) => {
  const typed = (typedRaw || '').toString()
  const target = (targetRaw || '').toString()
  if (!target) return { ok: true, matched: '', rest: '', wrong: '' }
  if (!typed) return { ok: true, matched: '', rest: target, wrong: '' }

  const t = typed.toLowerCase()
  const w = target.toLowerCase()
  let i = 0
  for (; i < Math.min(t.length, w.length); i += 1) {
    if (t[i] !== w[i]) break
  }

  const isOkSoFar = i === typed.length
  return {
    ok: isOkSoFar,
    matched: target.slice(0, i),
    wrong: isOkSoFar ? '' : target.slice(i, Math.min(i + 1, target.length)),
    rest: isOkSoFar ? target.slice(i) : target.slice(Math.min(i + 1, target.length))
  }
}

const GameBoard = ({ onGameOver = () => {} }) => {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timer, setTimer] = useState(60)
  const [active, setActive] = useState([]) // {id, text, duration, x}
  const [input, setInput] = useState('')
  const MAX_ACTIVE_WORDS = 1
  const totalTypedRef = useRef(0)
  const correctTypedRef = useRef(0)
  const streakRef = useRef(0)
  const spawnRef = useRef(null)
  const [message, setMessage] = useState('')
  const messageTimeoutRef = useRef(null)
  const { playHit, playMiss, playLevel } = useSounds()

  // control fall speed and spawn frequency
  // slow base duration so words fall slower for readability; level still speeds slightly
  const speedByLevel = useMemo(() => Math.max(3.6 - level * 0.08, 1.8), [level])
  // spawn interval: keep a comfortable gap between words
  const densityMs = useMemo(() => Math.max(2200 - level * 120, 900), [level])
  const spawnCooldownRef = useRef(false)
  const gameAreaRef = useRef(null)

  const activeCountRef = useRef(0)
  useEffect(() => {
    activeCountRef.current = active.length
  }, [active.length])

  // Prefer showing prefix-match feedback against the word the user is currently typing toward.
  const activeWord = useMemo(() => {
    if (!active.length) return null
    const t = (input || '').trim().toLowerCase()
    if (t) {
      const candidate = active.find((w) => (w?.text || '').toLowerCase().startsWith(t))
      if (candidate) return candidate
    }
    return active[0]
  }, [active, input])

  const typed = input
  const matchInfo = useMemo(() => getPrefixMatchInfo(typed, activeWord?.text || ''), [typed, activeWord?.text])

  const showMessage = useCallback((text, ms) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    setMessage(text)
    messageTimeoutRef.current = setTimeout(() => setMessage(''), ms)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (timer <= 0 || misses >= 3) {
      onGameOver({ score, accuracy: Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100), level })
    }
  }, [timer, misses, onGameOver, score, level])

  // Spawn words up to a capped amount. If we're in cooldown, skip spawning until ready.
  const spawn = useCallback(async () => {
    console.debug('[GameBoard] spawn called, active.length=', activeCountRef.current)
    if (activeCountRef.current >= MAX_ACTIVE_WORDS || spawnCooldownRef.current) return

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

    const fallback = [
      'neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer',
      'array', 'string', 'object', 'method', 'module', 'import', 'export', 'bundle', 'deploy', 'docker', 'server',
      'client', 'router', 'render', 'canvas', 'sprite', 'combo', 'streak', 'score', 'timer', 'focus', 'reflex',
      'syntax', 'compile', 'debug', 'commit', 'branch', 'merge', 'rebase', 'update', 'patch', 'version',
      'cipher', 'token', 'secure', 'random', 'vector', 'binary', 'memory', 'thread', 'cache', 'buffer',
      'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'signal', 'fusion', 'plasma', 'photon', 'aurora',
      'rapid', 'swift', 'brisk', 'quick', 'shift', 'blink', 'jump', 'dodge', 'boost', 'pulse'
    ]

    const pickFallbackText = () => fallback[Math.floor(Math.random() * fallback.length)]

    try {
      const words = await getWords({ count: 1, level })
      if (!words || !words.length) throw new Error('no words')
      const w = words[0]
      setActive((cur) => {
        if (cur.length >= MAX_ACTIVE_WORDS) return cur
        if (cur.some((x) => (x.text || '').toLowerCase() === (w.text || '').toLowerCase())) return cur
        const payload = [
          ...cur,
          { id: makeId(), text: w.text, duration: Math.max(2.6, speedByLevel + Math.random() * 1.2), x: pickX() }
        ]
        console.debug('[GameBoard] spawned word from API', payload[0])
        return payload
      })
    } catch (e) {
      let text = pickFallbackText()
      setActive((cur) => {
        if (cur.length >= MAX_ACTIVE_WORDS) return cur
        // try a couple times to avoid duplicates already on screen
        if (cur.some((x) => (x.text || '').toLowerCase() === (text || '').toLowerCase())) {
          for (let i = 0; i < 4; i += 1) {
            const next = pickFallbackText()
            if (!cur.some((x) => (x.text || '').toLowerCase() === (next || '').toLowerCase())) {
              text = next
              break
            }
          }
        }
        const payload = [
          ...cur,
          { id: makeId(), text, duration: Math.max(2.6, speedByLevel + Math.random() * 1.2), x: pickX() }
        ]
        console.debug('[GameBoard] spawned fallback word', payload[0])
        return payload
      })
    }
  }, [level, speedByLevel])

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
    showMessage('😵 Too Slow!', 1200)
    // short cooldown before next spawn to avoid immediate respawn
    spawnCooldownRef.current = true
    setTimeout(() => (spawnCooldownRef.current = false), Math.max(900, Math.floor(densityMs / 2)))
  }, [playMiss, densityMs, showMessage])

  const handleChange = (e) => setInput(e.target.value)

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setInput('')
      return
    }
  }

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
        showMessage("🔥 You're on Fire!", 1500)
      }
    } else {
      setMisses((m) => m + 1)
      streakRef.current = 0
      playMiss()
      showMessage('❌ Wrong!', 900)
    }
    setInput('')
  }

  useEffect(() => {
    if (level > 1) {
      playLevel()
      showMessage(`Level ${level} — Speed Up!`, 1200)
    }
  }, [level, playLevel, showMessage])

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full overflow-hidden rounded-xl border bg-card p-4 game-area pt-14 pb-24"
      style={{ height: '70dvh', maxHeight: 680, minHeight: 420 }}
    >
      {active.map((w) => (
        <FallingWord key={w.id} {...w} onComplete={handleComplete} />
      ))}

      {message && (
        <div className="absolute left-1/2 -translate-x-1/2 top-6 px-4 py-2 rounded-lg bg-black/40 border border-white/10 neon-blue">{message}</div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t game-bottom-bar" style={{ backdropFilter: 'blur(4px)' }}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a falling word and hit Enter"
            className="flex-1 px-4 py-3 rounded bg-transparent border border-white/10"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            aria-label="Type the falling word"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-3 rounded border border-white/10 bg-black/20 hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit typed word"
          >
            Enter
          </button>
        </form>
        <div className="mt-2 text-xs text-slate-400">Tip: Press Esc to clear.</div>
      </div>

      <ScoreBoard score={score} accuracy={Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100)} level={level} timer={timer} misses={misses} />
    </div>
  )
}

export default GameBoard
