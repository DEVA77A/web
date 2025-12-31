export const getWords = (req, res) => {
	const fallback = [
		'neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer',
		'array', 'string', 'object', 'method', 'module', 'import', 'export', 'bundle', 'deploy', 'docker', 'server',
		'client', 'router', 'render', 'canvas', 'sprite', 'combo', 'streak', 'score', 'timer', 'focus', 'reflex',
		'syntax', 'compile', 'debug', 'commit', 'branch', 'merge', 'rebase', 'update', 'patch', 'version',
		'cipher', 'token', 'secure', 'random', 'vector', 'binary', 'memory', 'thread', 'cache', 'buffer',
		'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'signal', 'fusion', 'plasma', 'photon', 'aurora',
		'rapid', 'swift', 'brisk', 'quick', 'shift', 'blink', 'jump', 'dodge', 'boost', 'pulse'
	]
	const count = Math.max(1, Math.min(10, parseInt(req.query.count || '3', 10)))
	const words = []
	const used = new Set()
	for (let i = 0; i < count; i++) {
		let w = fallback[Math.floor(Math.random() * fallback.length)]
		for (let t = 0; t < 6 && used.has(w); t += 1) {
			w = fallback[Math.floor(Math.random() * fallback.length)]
		}
		used.add(w)
		words.push({ text: w })
	}
	res.json(words)
}

export default { getWords }
