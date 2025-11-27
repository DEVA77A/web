import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Single GSAP implementation: animates word top->bottom and calls onFall(id) on completion
const FallingWord = ({ id, text, x = 0, duration = 4, onFall = () => {} }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const targetY = (window?.innerHeight ?? 800) + 120

    gsap.set(el, { x, y: -60, opacity: 0 })
    const tl = gsap.to(el, {
      y: targetY,
      opacity: 1,
      duration: Math.max(0.9, duration),
      ease: 'power1.in',
      onComplete: () => onFall(id)
    })

    return () => tl.kill()
  }, [id, x, duration, onFall])

  return (
    <div ref={ref} className="falling-word" style={{ position: 'absolute', left: x }}>
      {text}
    </div>
  )
}

export default FallingWord

