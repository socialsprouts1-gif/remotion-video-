// Storage for demo workflow rows. The site keeps no database: the default is
// in memory and is lost on restart. createStore(dir) writes JSONL files (tests).
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

export function createMemoryStore(limit = 200) {
  const tables = new Map()
  return {
    async append(name, record) {
      const rows = tables.get(name) || []
      const row = { id: crypto.randomUUID(), ts: new Date().toISOString(), ...record }
      rows.push(row)
      tables.set(name, rows.slice(-limit))
      return row
    },
    async list(name) {
      return [...(tables.get(name) || [])]
    },
  }
}
