import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const FallingWord = ({ id, text, duration = 4, x = 0, onComplete = () => {} }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const node = ref.current
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800
    // targetY should be the parent container height so word falls to bottom of game area
    const parent = node.parentElement
    let bottomReserve = 0
    try {
      const bottomBar = parent ? parent.querySelector('.game-bottom-bar') : null
      bottomReserve = bottomBar ? bottomBar.offsetHeight : 0
    } catch (e) {
      bottomReserve = 0
    }
    const targetY = parent
      ? Math.max(140, parent.clientHeight - bottomReserve - 18)
      : (typeof window !== 'undefined' ? window.innerHeight + 140 : 900)

    // initialize position and slight random rotation
    const rot = (Math.random() - 0.5) * 12
    const drift = (Math.random() - 0.5) * Math.min(80, vw * 0.08)

    // clamp initial left so element starts inside parent bounds (avoid clipping)
    let initialLeft = x || 0
    try {
      const parentEl = node.parentElement
      const pw = parentEl ? parentEl.clientWidth : vw
      const elw = node.offsetWidth || 120
      const pad = 8
      const maxLeft = Math.max(pad, pw - elw - pad)
      if (initialLeft < pad) initialLeft = pad
      if (initialLeft > maxLeft) initialLeft = maxLeft
      // apply left via style so GSAP translateX doesn't permanently move it off-screen
      node.style.left = `${initialLeft}px`
    } catch (e) {
      node.style.left = `${initialLeft}px`
    }

    // ensure the word is visible immediately (avoid long fade-in)
    gsap.set(node, { y: -36 + Math.random() * -12, opacity: 1, rotation: rot })

    // main fall tween with onUpdate to simulate motion-blur by adjusting CSS filter and scale
    const tl = gsap.to(node, {
      y: targetY,
      // apply a small transform drift so words don't slide outside bounds much
      x: `+=${drift}`,
      rotation: rot + (Math.random() - 0.5) * 18,
      opacity: 1,
      // use provided duration but prefer a slower minimum for readability
      duration: Math.max(2.6, duration),
      ease: 'power1.out',
      onUpdate: function () {
        const p = tl.progress()
        // tiny blur and small scale so motion remains readable
        const blur = Math.min(0.35 * p, 0.35)
        const s = 1 + p * 0.02
        gsap.set(node, { filter: `blur(${blur}px)`, scale: s })
      },
      onComplete: () => {
        // clear transforms/filters before removing
        gsap.set(node, { filter: 'none', scale: 1 })
        onComplete(id)
      }
    })

    return () => {
      try {
        tl.kill()
      } catch (e) {}
    }
  }, [id, duration, x, onComplete])

  const inlineStyle = {
    left: x,
    position: 'absolute',
    pointerEvents: 'none',
    willChange: 'transform,filter,opacity',
    color: '#e6f2ff',
    background: 'rgba(8,12,20,0.88)',
    padding: '0.5rem 0.45rem',
    fontSize: '1.45rem',
    fontWeight: 800,
    borderRadius: '8px',
    zIndex: 9999,
    whiteSpace: 'nowrap'
  }

  return (
    <div ref={ref} className="falling-word" style={inlineStyle} aria-hidden>
      {text}
    </div>
  )
}

export default FallingWord
