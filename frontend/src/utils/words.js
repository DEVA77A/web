// Small word list and random generator used by the frontend-only game.
const WORDS = [
  'neon','cyber','react','keyboard','sprint','speed','async','node','mongo','atlas','tailwind','framer','jump','swift','blink','shift','focus','compile','debug','logic'
]

export function randomWord(level = 1) {
  // choose from more difficult words as level increases
  const idx = Math.floor(Math.random() * WORDS.length)
  return WORDS[idx]
}

export default { randomWord }
