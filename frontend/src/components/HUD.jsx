import React from 'react'

const Heart = ({ filled = true }) => (
  <span className={`heart ${filled ? 'filled' : 'empty'}`}>❤</span>
)

const HUD = ({ score = 0, lives = 3, level = 1 }) => {
  return (
    <div className="hud">
      <div className="hud-left">Score <strong>{score}</strong></div>
      <div className="hud-center">Level <strong>{level}</strong></div>
      <div className="hud-right">{[0,1,2].map((i) => <Heart key={i} filled={i < lives} />)}</div>
    </div>
  )
}

export default HUD
