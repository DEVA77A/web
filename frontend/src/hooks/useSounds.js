// Minimal sound hook stub — returns no-op play functions so components can call them safely.
import { useCallback, useRef } from 'react'

// Small WebAudio-based sound hook so we don't need external assets.
// Produces short tones for hit/miss/level events.
const useSounds = () => {
  const ctxRef = useRef(null)

  const ensure = () => {
    if (!ctxRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        ctxRef.current = new AudioContext()
      } catch (e) {
        ctxRef.current = null
      }
    }
    return ctxRef.current
  }

  const playTone = useCallback((freq = 440, type = 'sine', duration = 0.08, gain = 0.08) => {
    const ctx = ensure()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.value = gain
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    setTimeout(() => { try { o.stop() } catch {} }, duration * 1000 + 20)
  }, [])

  const playHit = useCallback(() => playTone(720, 'sine', 0.06, 0.09), [playTone])
  const playMiss = useCallback(() => playTone(220, 'sawtooth', 0.14, 0.12), [playTone])
  const playLevel = useCallback(() => {
    playTone(980, 'triangle', 0.08, 0.12)
    setTimeout(() => playTone(660, 'sine', 0.08, 0.09), 90)
  }, [playTone])

  return { playHit, playMiss, playLevel }
}

export default useSounds
