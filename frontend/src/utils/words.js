// Small word list and random generator used by the frontend-only game.
const WORDS = [
  'neon', 'cyber', 'react', 'keyboard', 'sprint', 'speed', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer',
  'array', 'string', 'object', 'method', 'module', 'import', 'export', 'bundle', 'deploy', 'docker', 'server',
  'client', 'router', 'render', 'canvas', 'sprite', 'combo', 'streak', 'score', 'timer', 'focus', 'reflex',
  'syntax', 'compile', 'debug', 'commit', 'branch', 'merge', 'rebase', 'update', 'patch', 'version',
  'cipher', 'token', 'secure', 'random', 'vector', 'binary', 'memory', 'thread', 'cache', 'buffer',
  'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'signal', 'fusion', 'plasma', 'photon', 'aurora',
  'rapid', 'swift', 'brisk', 'quick', 'shift', 'blink', 'jump', 'dodge', 'boost', 'pulse'
]

export function randomWord(level = 1) {
  // choose from more difficult words as level increases
  const idx = Math.floor(Math.random() * WORDS.length)
  return WORDS[idx]
}

export default { randomWord }
