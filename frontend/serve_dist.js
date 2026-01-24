const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 58631
const dist = path.join(__dirname, 'dist')

app.use(express.static(dist))
// Use explicit wildcard pattern that works with path-to-regexp
app.get('/*', (req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(port, '127.0.0.1', () => {
  console.log(`Serving dist at http://localhost:${port}`)
})

// keep process alive
process.on('SIGINT', () => process.exit())
