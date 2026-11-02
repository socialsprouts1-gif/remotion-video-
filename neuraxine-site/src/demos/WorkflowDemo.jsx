import { useEffect, useRef, useState } from 'react'
import { workflows } from './data'

// An n8n-style canvas: nodes execute in order and pass data along.
export default function WorkflowDemo() {
  const [key, setKey] = useState('lead')
  const [state, setState] = useState([]) // per node: idle | running | done
  const [selected, setSelected] = useState(0)
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)
  const [runs, setRuns] = useState(0)
  const timers = useRef([])
  const wf = workflows[key]

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => {
    clear()
    setState(wf.nodes.map(() => 'idle'))
    setLog([])
    setSelected(0)
    setRunning(false)
    return clear
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const execute = () => {
    clear()
    setRunning(true)
    setLog([])
    setState(wf.nodes.map(() => 'idle'))
    let t = 0
    let total = 0
    wf.nodes.forEach((n, i) => {
      const ms = 280 + ((i * 137) % 420) + (n.kind === 'ai' ? 700 : 0)
      timers.current.push(
        setTimeout(() => {
          setState((s) => s.map((v, k) => (k === i ? 'running' : v)))
          setSelected(i)
        }, t),
      )
      t += ms
      total += ms
      timers.current.push(
        setTimeout(() => {
          setState((s) => s.map((v, k) => (k === i ? 'done' : v)))
          setLog((l) => [...l, { node: `${n.app} · ${n.title}`, ms }])
        }, t),
      )
      t += 120
    })
    timers.current.push(
      setTimeout(() => {
        setRunning(false)
        setRuns((r) => r + 1)
        setLog((l) => [...l, { node: 'Workflow finished', ms: total, end: true }])
      }, t),
    )
  }

  const out = wf.nodes[selected]
  return (
    <div className="demo demo-wf">
      <div className="demo__bar">
        <div className="chips" role="tablist" aria-label="Workflow template">
          {Object.entries(workflows).map(([k, v]) => (
            <button key={k} role="tab" aria-selected={k === key} className={`chip ${k === key ? 'is-on' : ''}`} onClick={() => setKey(k)}>
              {v.label}
            </button>
          ))}
        </div>
        <button className="btn btn--lime btn--sm" onClick={execute} disabled={running}>
          {running ? 'Running…' : '▶ Execute workflow'}
        </button>
      </div>

      <div className="wf-canvas">
        {wf.nodes.map((n, i) => (
          <div key={`${key}-${i}`} className="wf-step">
            {i > 0 && <span className={`wf-wire ${state[i - 1] === 'done' ? 'is-live' : ''}`} aria-hidden="true" />}
            <button className={`wf-node k-${n.kind} s-${state[i] || 'idle'} ${selected === i ? 'is-sel' : ''}`} onClick={() => setSelected(i)}>
              <span className="wf-node__app mono">{n.app}</span>
              <span className="wf-node__title">{n.title}</span>
              <span className="wf-node__status" aria-label={state[i]} />
            </button>
          </div>
        ))}
      </div>

      <div className="wf-panels">
        <div className="wf-out">
          <div className="mono label">Output · {out.app}</div>
          <pre className="mono">{JSON.stringify(state[selected] === 'done' ? out.out : { waiting: 'execute to see data' }, null, 2)}</pre>
        </div>
        <div className="wf-log">
          <div className="mono label">Executions · {runs} this session</div>
          <ol data-lenis-prevent>
            {log.map((l, i) => (
              <li key={i} className={`mono ${l.end ? 'end' : ''}`}>
                <span>{l.end ? '✓' : '•'}</span>
                <b>{l.node}</b>
                <em>{l.ms} ms</em>
              </li>
            ))}
            {!log.length && <li className="mono muted">Press Execute to run the workflow.</li>}
          </ol>
        </div>
      </div>
    </div>
  )
}
