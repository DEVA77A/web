import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FallingWord from './FallingWord2.jsx'
import ScoreBoard from './ScoreBoard.jsx'
import { getWords } from '../services/api.js'
import useSounds from '../hooks/useSounds.js'
import '../styles/PowerEffects.css'

// Clean GameBoard implementation used while the original file is repaired
const randX = () => Math.max(16, Math.floor(Math.random() * (Math.max((typeof window !== 'undefined' ? window.innerWidth : 800) - 160, 200))))

const makeId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch (e) { }
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

const GameBoard = ({ onGameOver = () => { }, onExit = () => { } }) => {
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(1)
  const [isIntermission, setIsIntermission] = useState(true)
  const [intermissionTimer, setIntermissionTimer] = useState(5)
  const [isPaused, setIsPaused] = useState(false)
  const INTERMISSION_DURATION = 5
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timer, setTimer] = useState(60)
  const [active, setActive] = useState([]) // {id, text, duration, x, isSlashed}
  const [currentPower, setCurrentPower] = useState(null) // {type, icon, label, color}
  const [powerActive, setPowerActive] = useState({ slow: false, freeze: false })
  const [slashedWordId, setSlashedWordId] = useState(null)
  const powerUsedRef = useRef({ 20: false, 40: false })

  const POWER_TYPES = [
    { type: 'slow', icon: '⚡', label: 'CHRONO SLOW', color: '#fbbf24' },
    { type: 'freeze', icon: '❄️', label: 'FROST LOCK', color: '#0ea5e9' },
    { type: 'skip', icon: '🔥', label: 'DRAGON SLASH', color: '#ef4444' },
    { type: 'life', icon: '💖', label: 'VITAL SURGE', color: '#ec4899' }
  ]

  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const MAX_ACTIVE_WORDS = 1
  const totalTypedRef = useRef(0)
  const correctTypedRef = useRef(0)
  const streakRef = useRef(0)
  const spawnRef = useRef(null)
  const [message, setMessage] = useState('')
  const messageTimeoutRef = useRef(null)
  const { playHit, playMiss, playLevel } = useSounds()

  const roundSpeedFactor = useMemo(() => {
    if (round === 2) return 0.8
    if (round === 3) return 0.65
    return 1.0
  }, [round])

  const speedByLevel = useMemo(() => Math.max((3.6 - level * 0.08) * roundSpeedFactor, 0.8), [level, roundSpeedFactor])
  const densityMs = useMemo(() => Math.max(2200 - level * 120, 900), [level])
  const spawnCooldownRef = useRef(false)
  const gameAreaRef = useRef(null)

  const activeCountRef = useRef(0)
  useEffect(() => {
    activeCountRef.current = active.length
  }, [active.length])

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
    if (!isIntermission && !isPaused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isIntermission, isPaused])

  useEffect(() => {
    powerUsedRef.current = { 20: false, 40: false }
  }, [round])

  useEffect(() => {
    const t = setInterval(() => {
      if (isPaused) return

      if (isIntermission) {
        setIntermissionTimer((prev) => {
          if (prev <= 1) {
            setIsIntermission(false)
            setTimer(60)
            setMisses(0)
            setActive([])
            return 0
          }
          return prev - 1
        })
      } else {
        setTimer((t) => {
          const next = Math.max(0, t - 1)
          if ((next === 40 && !powerUsedRef.current[20]) || (next === 20 && !powerUsedRef.current[40])) {
            const timeKey = next === 40 ? 20 : 40
            powerUsedRef.current[timeKey] = true
            const randomPower = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)]
            setCurrentPower(randomPower)
            showMessage(`NEW POWER UNLOCKED: ${randomPower.icon}`, 2000)
          }
          return next
        })
      }
    }, 1000)
    return () => clearInterval(t)
  }, [isIntermission, isPaused])

  // Initial message for Round 1
  useEffect(() => {
    if (round === 1 && isIntermission) {
      showMessage(`GET READY FOR ROUND 1...`, 3000)
    }
  }, [])

  const activatePower = useCallback(() => {
    if (!currentPower || isPaused || isIntermission) return
    const { type, label } = currentPower
    showMessage(`${label} !!!`, 2000)
    setCurrentPower(null)

    if (type === 'slow') {
      setPowerActive(p => ({ ...p, slow: true }))
      setTimeout(() => setPowerActive(p => ({ ...p, slow: false })), 5000)
    } else if (type === 'freeze') {
      setPowerActive(p => ({ ...p, freeze: true }))
      setTimeout(() => setPowerActive(p => ({ ...p, freeze: false })), 3000)
    } else if (type === 'skip') {
      if (active.length > 0) {
        const target = active[0]
        setSlashedWordId(target.id)
        // Keep it "stopped" for a bit before removing
        setTimeout(() => {
          setActive(arr => arr.filter(w => w.id !== target.id))
          setScore(s => s + (10 * level * round))
          setSlashedWordId(null)
          playHit()
        }, 800)
      }
    } else if (type === 'life') {
      setMisses(m => Math.max(0, m - 1))
      showMessage('+1 HP REGAINED!', 1500)
      const blood = document.createElement('div')
      blood.className = 'hp-gain-effect'
      document.querySelector('.game-area')?.appendChild(blood)
      setTimeout(() => blood.remove(), 800)
    }
  }, [currentPower, isPaused, isIntermission, active, level, round, playHit, showMessage])

  const hasEndedRef = useRef(false)
  useEffect(() => {
    if (hasEndedRef.current) return
    if (misses >= 3) {
      hasEndedRef.current = true
      onGameOver({ score, accuracy: Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100), level, round })
      if (spawnRef.current) clearInterval(spawnRef.current)
      return
    }
    if (timer <= 0 && !isIntermission) {
      if (round < 3) {
        setIsIntermission(true)
        setActive([])
        setIntermissionTimer(INTERMISSION_DURATION)
        setRound((r) => r + 1)
        showMessage(`ROUND ${round} COMPLETE! GET READY...`, 3000)
      } else {
        hasEndedRef.current = true
        onGameOver({ score, accuracy: Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100), level, round })
        if (spawnRef.current) clearInterval(spawnRef.current)
      }
    }
  }, [timer, misses, onGameOver, score, level, round, isIntermission])

  const spawn = useCallback(async () => {
    if (activeCountRef.current >= MAX_ACTIVE_WORDS || spawnCooldownRef.current || isIntermission || isPaused) return
    let areaWidth = null
    try {
      const el = gameAreaRef.current || document.querySelector('.game-area')
      if (el) { areaWidth = Math.max(120, Math.floor(el.getBoundingClientRect().width)) }
    } catch (e) { }

    const pickX = () => {
      if (!areaWidth) return randX()
      const pad = 12
      return Math.floor(pad + Math.random() * Math.max(120, areaWidth - pad * 2))
    }

    const fallback = ['neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer', 'array', 'string', 'object', 'method', 'module', 'import', 'export', 'bundle', 'deploy', 'docker', 'server', 'client', 'router', 'render', 'canvas', 'sprite', 'combo', 'streak', 'score', 'timer', 'focus', 'reflex', 'syntax', 'compile', 'debug', 'commit', 'branch', 'merge', 'rebase', 'update', 'patch', 'version', 'cipher', 'token', 'secure', 'random', 'vector', 'binary', 'memory', 'thread', 'cache', 'buffer', 'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'signal', 'fusion', 'plasma', 'photon', 'aurora', 'rapid', 'swift', 'brisk', 'quick', 'shift', 'blink', 'jump', 'dodge', 'boost', 'pulse']
    const pickFallbackText = () => fallback[Math.floor(Math.random() * fallback.length)]

    try {
      const words = await getWords({ count: 1, level })
      const text = (words && words.length) ? words[0].text : pickFallbackText()
      setActive((cur) => {
        if (cur.length >= MAX_ACTIVE_WORDS || cur.some(x => x.text.toLowerCase() === text.toLowerCase())) return cur
        return [...cur, { id: makeId(), text, duration: Math.max(0.8, speedByLevel + (Math.random() * 1.2 * roundSpeedFactor)), x: pickX() }]
      })
    } catch (e) {
      const text = pickFallbackText()
      setActive((cur) => {
        if (cur.length >= MAX_ACTIVE_WORDS || cur.some(x => x.text.toLowerCase() === text.toLowerCase())) return cur
        return [...cur, { id: makeId(), text, duration: Math.max(0.8, speedByLevel + (Math.random() * 1.2 * roundSpeedFactor)), x: pickX() }]
      })
    }
  }, [level, speedByLevel, isIntermission, isPaused, roundSpeedFactor])

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
    spawnCooldownRef.current = true
    setTimeout(() => (spawnCooldownRef.current = false), Math.max(900, Math.floor(densityMs / 2)))
  }, [playMiss, densityMs, showMessage])

  const handleChange = (e) => setInput(e.target.value)

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (!isIntermission && !hasEndedRef.current) {
          setIsPaused((prev) => !prev)
        }
        setInput('')
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        activatePower()
        return
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isIntermission, activatePower])

  const handleKeyDown = (e) => {
    // Keep internal keydown empty as we use global listener
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
        const next = s + 10 * level * round
        if (next % 100 === 0) setLevel((lv) => lv + 1)
        return next
      })
      correctTypedRef.current += 1
      streakRef.current += 1
      playHit()
      if (streakRef.current >= 5) showMessage("🔥 You're on Fire!", 1500)
    } else {
      streakRef.current = 0
      playMiss()
      showMessage('❌ Wrong!', 900)
    }
    setInput('')
  }

  useEffect(() => {
    if (level > 1) { playLevel(); showMessage(`Level ${level} — Speed Up!`, 1200) }
  }, [level, playLevel, showMessage])

  useEffect(() => {
    if (round > 1) { playLevel(); showMessage(`ROUND ${round} — EXTREME SPEED!`, 1500) }
  }, [round, playLevel, showMessage])

  return (
    <div ref={gameAreaRef} className="relative w-full overflow-hidden rounded-xl border bg-card p-4 game-area pt-14 pb-24" style={{ height: '70dvh', maxHeight: 680, minHeight: 420 }}>
      {powerActive.freeze && <div className="water-freeze-overlay"><div className="water-ripple" style={{ left: '20%', top: '30%' }} /><div className="water-ripple" style={{ left: '70%', top: '60%', animationDelay: '0.5s' }} /></div>}
      <button type="button" onClick={() => setIsPaused(!isPaused)} className="absolute top-4 right-4 z-[9998] p-2 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 transition-all neon-blue-hover" aria-label={isPaused ? "Resume game" : "Pause game"}>
        {isPaused ? <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> : <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M6 14h4V5H6v14zm8-14v14h4V5h-4z" /></svg>}
      </button>
      {active.map((w) => <FallingWord key={w.id} {...w} paused={isPaused} isSlowed={powerActive.slow} isFrozen={powerActive.freeze} isSlashed={slashedWordId === w.id} onComplete={handleComplete} />)}
      {message && <div className="absolute left-1/2 -translate-x-1/2 top-6 px-4 py-2 rounded-lg bg-black/40 border border-white/10 neon-blue z-[10000]">{message}</div>}
      {isIntermission && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]"><h2 className="text-4xl font-bold neon-pink mb-4">ROUND {round} STARTING</h2><div className="text-6xl font-bold neon-blue mb-4">{intermissionTimer}</div><p className="text-xl text-slate-300">Prepare for more speed!</p></div>}
      {isPaused && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-[9999]"><h2 className="text-6xl font-bold neon-blue mb-8 tracking-widest">PAUSED</h2><button onClick={() => setIsPaused(false)} className="btn primary px-12 py-5 text-2xl gta-font border-2 border-blue-400 hover:bg-blue-500/20 transition-all mb-4" style={{ textTransform: 'uppercase', width: '320px' }}>Resume Mission</button><button onClick={onExit} className="btn px-12 py-5 text-xl gta-font border border-white/20 hover:bg-white/10 transition-all" style={{ textTransform: 'uppercase', width: '320px' }}>Return to Home</button></div>}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t game-bottom-bar" style={{ backdropFilter: 'blur(4px)' }}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input ref={inputRef} value={input} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={currentPower ? `READY: ${currentPower.icon} - Space to Use!` : "Type and hit Enter"} className="flex-1 px-4 py-3 rounded bg-transparent border border-white/10 focus:border-blue-500 transition-colors" autoFocus autoComplete="off" spellCheck={false} autoCapitalize="none" aria-label="Type the falling word" disabled={isPaused || isIntermission} />
          {currentPower && <div className="px-4 py-3 rounded border-2 flex items-center justify-center power-pill power-active-pulse" style={{ borderColor: currentPower.color, color: currentPower.color, minWidth: '60px' }} title={`Power: ${currentPower.label}`}><span className="text-2xl">{currentPower.icon}</span></div>}
          <button type="submit" disabled={!input.trim() || isPaused || isIntermission} className="px-6 py-3 rounded border border-white/10 bg-black/20 hover:bg-white/10 disabled:opacity-30 transition-all text-white font-bold" aria-label="Submit typed word">ENTER</button>
        </form>
        <div className="mt-2 text-xs text-slate-400 flex justify-between"><span>Tip: Press Esc to pause.</span>{currentPower && <span className="neon-blue font-bold">SPACE BAR TO ACTIVATE SKILL!</span>}</div>
      </div>
      <ScoreBoard score={score} accuracy={Math.round((correctTypedRef.current / (totalTypedRef.current || 1)) * 100)} level={level} round={round} timer={timer} misses={misses} />
    </div>
  )
}

export default GameBoard
