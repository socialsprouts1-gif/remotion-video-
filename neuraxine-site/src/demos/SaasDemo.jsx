import { useState } from 'react'
import { members, checkins, checkinHours } from './data'
import { Browser, ModeBadge } from '../components/Devices'

const TABS = ['Overview', 'Members', 'Renewals']

export default function SaasDemo() {
  const [tab, setTab] = useState('Overview')
  const [q, setQ] = useState('')
  const [sent, setSent] = useState({})
  const expiring = members.filter((m) => m[2] === 'Expiring' || m[2] === 'Expired')
  const max = Math.max(...checkins)

  const sendAll = () => {
    expiring.forEach((m, i) => {
      setTimeout(() => setSent((s) => ({ ...s, [m[0]]: 'sending' })), i * 350)
      setTimeout(() => setSent((s) => ({ ...s, [m[0]]: 'sent' })), i * 350 + 700)
    })
  }
  const sentCount = Object.values(sent).filter((v) => v === 'sent').length

  return (
    <div className="demo">
      <div className="demo__bar">
        <span className="demo__title">IronFit · gym management panel</span>
        <ModeBadge live={false} liveText="" offText="Interactive prototype" />
      </div>
      <Browser url="app.ironfit.in/admin">
      <div className="demo-saas">
      <aside className="saas-side">
        <b className="saas-logo">IronFit <span className="mono">admin</span></b>
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'is-on' : ''} onClick={() => setTab(t)}>
            {t}
            {t === 'Renewals' && <span className="badge">{expiring.length - sentCount}</span>}
          </button>
        ))}
      </aside>
      <div className="saas-main">
        <div className="kpis">
          <div><span className="mono label">Active members</span><b>248</b></div>
          <div><span className="mono label">Check-ins today</span><b>63</b></div>
          <div><span className="mono label">Renewals due</span><b>{expiring.length - sentCount}</b></div>
          <div><span className="mono label">Reminders sent</span><b className="lime">{sentCount}</b></div>
        </div>

        {tab === 'Overview' && (
          <div className="chart">
            <div className="mono label">Check-ins by hour · today</div>
            <div className="bars">
              {checkins.map((v, i) => (
                <div key={i} className="bar" style={{ '--h': `${(v / max) * 100}%`, '--i': i }}>
                  <span className="mono">{checkinHours[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Members' && (
          <div className="mtable">
            <input id="member-search" placeholder="Search members…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div data-lenis-prevent className="mtable__rows">
              {members
                .filter((m) => m[0].toLowerCase().includes(q.toLowerCase()))
                .map((m) => (
                  <div key={m[0]} className="mrow">
                    <span>{m[0]}</span>
                    <span className="muted">{m[1]}</span>
                    <span className={`pill s-${m[2].toLowerCase()}`}>{m[2]}</span>
                    <span className="muted mono">{m[3]}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'Renewals' && (
          <div className="renewals">
            <div className="renewals__head">
              <span className="muted">{expiring.length} memberships expiring or expired</span>
              <button className="btn btn--lime btn--sm" onClick={sendAll} disabled={sentCount === expiring.length}>
                {sentCount === expiring.length ? 'All reminders sent' : 'Send WhatsApp reminders'}
              </button>
            </div>
            {expiring.map((m) => (
              <div key={m[0]} className="mrow">
                <span>{m[0]}</span>
                <span className="muted">{m[1]}</span>
                <span className={`pill s-${m[2].toLowerCase()}`}>{m[2]}</span>
                <span className={`mono send s-${sent[m[0]] || 'idle'}`}>
                  {sent[m[0]] === 'sent' ? '✓ delivered' : sent[m[0]] === 'sending' ? 'sending…' : 'not sent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      </Browser>
      <p className="note">Sample gym data. The production version has payments and WhatsApp reminders wired in.</p>
    </div>
  )
}
