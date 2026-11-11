// Small in-memory fixed-window limiter, keyed by client IP.
export function rateLimit({ windowMs, max }) {
  const hits = new Map()
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'anon'
    const now = Date.now()
    const entry = hits.get(key)
    if (!entry || now > entry.reset) {
      hits.set(key, { count: 1, reset: now + windowMs })
      return next()
    }
    if (++entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)))
      return res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' })
    }
    next()
  }
}
