// Vercel serverless entry: every /api/* request is routed here (see vercel.json)
// and handled by the same Express app that server/index.js runs locally.
import { createApp } from '../server/app.js'

export default createApp()
