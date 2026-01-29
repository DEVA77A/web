import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import '../styles/Animations.css'

const LandingPage = () => {
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)
  const floatRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.from(titleRef.current, { y: -30, opacity: 0, duration: 0.7, ease: 'power3.out' })
      .from(subtitleRef.current, { y: -12, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
      .from(ctaRef.current, { scale: 0.92, opacity: 0, duration: 0.5, ease: 'back.out(1.4)' }, '-=0.3')

    // subtle floating words animation (decorative)
    gsap.utils.toArray('.hero-word').forEach((el, i) => {
      gsap.fromTo(el, { y: -10, opacity: 0.85 }, { y: 120, rotation: 6, duration: 6 + Math.random() * 3, repeat: -1, repeatDelay: 1 + Math.random() * 2, delay: i * 0.4, ease: 'none' })
    })

    return () => tl.kill()
  }, [])

  return (
    <>
      <div className="cyber-grid"></div>
      <div className="particles-bg">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>
      <div className="app-shell">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <span className="trophy-icon" style={{ fontSize: '3rem' }}>🏆</span>
            <h1 ref={titleRef} className="hero-title gtahero" style={{ margin: 0 }}>Type Sprint</h1>
          </div>
          <p ref={subtitleRef} className="mt-4 text-lg text-muted max-w-xl">A fast-paced, neon-styled typing sprint. Type falling words before they hit the ground — rack up combos, level up, and climb the leaderboard.</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/game" ref={ctaRef} className="btn cta-button bg-neon-green/20 border-neon-green/30">Start Game</Link>
            <Link to="/leaderboard" className="btn cta-button bg-neon-blue/10 border-neon-blue/20">Leaderboard</Link>
          </div>

          <div className="mt-6 text-sm text-muted">No account required — play instantly. Built with React, GSAP and a neon aesthetic.</div>
        </div>

        <div className="relative">
          <div className="glass-card rounded-xl p-4 shadow-lg" style={{ minHeight: 320 }}>
            <div className="relative h-64 overflow-hidden rounded">
              <div ref={floatRef} className="absolute inset-0">
                <span className="hero-word falling-word" style={{ left: '10%' }}>neon</span>
                <span className="hero-word falling-word" style={{ left: '40%' }}>react</span>
                <span className="hero-word falling-word" style={{ left: '70%' }}>cyber</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted">Preview: words fall smoothly with GSAP animation.</div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default LandingPage
