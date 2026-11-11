// Append-only JSONL storage. Swap for a database later without touching routes.
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export function createStore(dir) {
  const file = (name) => path.join(dir, `${name}.jsonl`)
  return {
    async append(name, record) {
      await fs.mkdir(dir, { recursive: true })
      const row = { id: crypto.randomUUID(), ts: new Date().toISOString(), ...record }
      await fs.appendFile(file(name), JSON.stringify(row) + '\n')
      return row
    },
    async list(name) {
      try {
        const txt = await fs.readFile(file(name), 'utf8')
        return txt.split('\n').filter(Boolean).map((l) => JSON.parse(l))
      } catch (e) {
        if (e.code === 'ENOENT') return []
        throw e
      }
    },
  }
}
