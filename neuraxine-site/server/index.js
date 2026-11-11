// Production entry: serves the built site and the API on one port.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createApp } from './app.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(here, '..', 'dist')
const app = createApp()

app.use(express.static(dist, { maxAge: '1h', index: false }))
app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')))

const port = Number(process.env.PORT) || 8787
app.listen(port, () => {
  console.log(`Neuraxine running on http://localhost:${port}`)
})
