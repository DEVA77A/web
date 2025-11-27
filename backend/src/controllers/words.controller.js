export const getWords = (req, res) => {
	const fallback = ['neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer']
	const count = Math.max(1, Math.min(10, parseInt(req.query.count || '3', 10)))
	const words = []
	for (let i = 0; i < count; i++) {
		const w = fallback[Math.floor(Math.random() * fallback.length)]
		words.push({ text: w })
	}
	res.json(words)
}

export default { getWords }
