import React from 'react'

const Pill = ({ label, value, className = '' }) => (
  <div className={`px-3 py-1 rounded-full text-sm border border-white/10 ${className}`}>
    <span className="text-slate-400 mr-1">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
)

const ScoreBoard = ({ score = 0, accuracy = 100, level = 1, timer = 60, misses = 0 }) => {
  return (
    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
      <div className="flex gap-2">
        <Pill label="Score" value={score} className="neon-blue" />
        <Pill label="Accuracy" value={`${accuracy}%`} className="neon-green" />
        <Pill label="Level" value={level} className="neon-pink" />
        <Pill label="Timer" value={`${timer}s`} className="text-slate-200" />
      </div>
      <div className="text-slate-300">Misses: {misses}/3</div>
    </div>
  )
}

export default ScoreBoard
