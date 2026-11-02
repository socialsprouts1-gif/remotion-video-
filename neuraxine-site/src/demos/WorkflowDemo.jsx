import { useEffect, useRef, useState } from 'react'
import { Play, Loader2, Check, Zap } from 'lucide-react'
import { workflows } from './data'
import { api } from '../lib/api'
import { Browser, ModeBadge } from '../components/Devices'
import BrandIcon from '../components/BrandIcon'

const APP_ICONS = { WhatsApp: 'siWhatsapp', Sheets: 'siGooglesheets', Shopify: 'siShopify', OpenAI: 'siClaude', Webhook: 'siN8n', Code: 'siN8n', IF: 'siN8n', Wait: 'siN8n', CRM: 'siHubspot', Exotel: null, Slack: null }

// n8n-style canvas. "Execute" runs the workflow on the server (/api/workflow/run),
// then replays the real per-node timings and outputs on the canvas.
export default function WorkflowDemo({ health }) {
  const [key, setKey] = useState('lead')
  const [input, setInput] = useState({ name: 'Rohit Kulkarni', phone: '+91 98765 44410', interest: '3 BHK, Baner', budget: '1.2 Cr' })
  const [status, setStatus] = useState([])
  const [results, setResults] = useState(null)
  const [selected, setSelected] = useState(0)
  const [running, setRunning] = useState(false)
  const [offline, setOffline] = useState(false)
  const timers = useRef([])
  const wf = workflows[key]

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => {
    clear()
    setStatus(wf.nodes.map(() => 'idle'))
    setResults(null)
    setSelected(0)
    setRunning(false)
    return clear
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const execute = async () => {
    clear()
    setRunning(true)
    setResults(null)
    setStatus(wf.nodes.map(() => 'idle'))
    let data
    try {
      data = await api('/api/workflow/run', { template: key, input: key === 'lead' ? input : undefined })
      setOffline(false)
    } catch {
      setOffline(true)
      data = { nodes: wf.nodes.map((n, i) => ({ ...n, status: 'done', live: false, ms: 120 + i * 40, out: n.out })) }
    }
    setResults(data)
    // Replay: each node shows "running" for at least 450ms so the flow is readable.
    let t = 0
    data.nodes.forEach((n, i) => {
      timers.current.push(setTimeout(() => (setStatus((s) => s.map((v, k) => (k === i ? 'running' : v))), setSelected(i)), t))
      t += Math.max(450, Math.min(n.ms, 2500))
      timers.current.push(setTimeout(() => setStatus((s) => s.map((v, k) => (k === i ? n.status : v))), t))
      t += 90
    })
    timers.current.push(setTimeout(() => setRunning(false), t))
  }

  const node = results?.nodes?.[selected]
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
        <ModeBadge live={!offline && !!health} liveText={health?.services?.webhook ? 'Runs on server · n8n connected' : 'Runs on our server'} offText="Offline demo" />
      </div>

      <Browser url={`automations.neuraxine.com/workflows/${key}`}>
        {key === 'lead' && (
          <form className="wf-input" onSubmit={(e) => (e.preventDefault(), execute())}>
            <span className="wf-input__title"><Zap size={14} /> Test lead</span>
            {[['name', 'Name'], ['phone', 'Phone'], ['interest', 'Looking for'], ['budget', 'Budget']].map(([k, l]) => (
              <label key={k}>
                <span>{l}</span>
                <input id={`wf-${k}`} value={input[k]} maxLength={60} onChange={(e) => setInput((o) => ({ ...o, [k]: e.target.value }))} />
              </label>
            ))}
          </form>
        )}
        <div className="wf-canvas">
          {wf.nodes.map((n, i) => (
            <div key={`${key}-${i}`} className="wf-step">
              {i > 0 && <span className={`wf-wire ${status[i - 1] === 'done' ? 'is-live' : ''}`} aria-hidden="true"><i /></span>}
              <button className={`wf-node k-${n.kind} s-${status[i] || 'idle'} ${selected === i ? 'is-sel' : ''}`} onClick={() => setSelected(i)}>
                <span className="wf-node__icon">
                  {APP_ICONS[n.app] ? <BrandIcon name={APP_ICONS[n.app]} size={18} color={APP_ICONS[n.app] === 'siN8n' || APP_ICONS[n.app] === 'siClaude' ? '#fff' : undefined} /> : <Zap size={16} />}
                </span>
                <span className="wf-node__app">{n.app === 'OpenAI' ? 'Claude' : n.app}</span>
                <span className="wf-node__title">{n.title}</span>
                <span className="wf-node__status">
                  {status[i] === 'running' ? <Loader2 size={14} className="spin" /> : status[i] === 'done' ? <Check size={14} strokeWidth={3} /> : null}
                </span>
              </button>
            </div>
          ))}
        </div>
        <div className="wf-panels">
          <div className="wf-out">
            <div className="label">
              Output · {wf.nodes[selected].app === 'OpenAI' ? 'Claude' : wf.nodes[selected].app}
              {node && status[selected] === 'done' && <span className={`tag ${node.live ? 'is-live' : ''}`}>{node.live ? 'real' : 'simulated'}</span>}
            </div>
            <pre>{JSON.stringify(node && status[selected] === 'done' ? node.out : { waiting: 'run the workflow to see data' }, null, 2)}</pre>
          </div>
          <div className="wf-log">
            <div className="label">Execution</div>
            <ol data-lenis-prevent>
              {results?.nodes?.map((n, i) =>
                status[i] === 'done' || status[i] === 'error' ? (
                  <li key={i} className={n.status}>
                    <span>{n.status === 'done' ? '✓' : '!'}</span>
                    <b>{n.app === 'OpenAI' ? 'Claude' : n.app} · {n.title}</b>
                    <em>{n.ms} ms</em>
                  </li>
                ) : null,
              )}
              {!running && !results && <li className="muted">Press “Execute workflow”.</li>}
            </ol>
          </div>
        </div>
        <div className="wf-foot">
          <button className="btn btn--primary btn--sm" onClick={execute} disabled={running}>
            {running ? <Loader2 size={15} className="spin" /> : <Play size={15} />} {running ? 'Running…' : 'Execute workflow'}
          </button>
          {results?.total_ms != null && !running && <span className="muted">Finished in {results.total_ms} ms on the server</span>}
        </div>
      </Browser>
    </div>
  )
}
