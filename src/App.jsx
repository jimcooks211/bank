import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './routes/signIn.jsx'
import './App.css'

// ── Device detection ──────────────────────────────────────────────────────────
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isAndroid = () => /android/i.test(navigator.userAgent)
const isIPhone = () => /iphone/i.test(navigator.userAgent)
const isStandalone = () =>
  window.navigator.standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches

// ── Location data ─────────────────────────────────────────────────────────────
const LOCATIONS = [
  { city: 'New York',  country: 'United States', code: 'US', flag: '🇺🇸', ping: 12 },
  { city: 'London',    country: 'United Kingdom', code: 'GB', flag: '🇬🇧', ping: 28 },
  { city: 'Tokyo',     country: 'Japan',          code: 'JP', flag: '🇯🇵', ping: 54 },
  { city: 'Frankfurt', country: 'Germany',        code: 'DE', flag: '🇩🇪', ping: 31 },
  { city: 'Singapore', country: 'Singapore',      code: 'SG', flag: '🇸🇬', ping: 67 },
  { city: 'Toronto',   country: 'Canada',         code: 'CA', flag: '🇨🇦', ping: 19 },
]

const FAKE_IPS = {
  US: '104.28.14.22', GB: '185.220.101.47', JP: '45.76.243.12',
  DE: '89.163.128.99', SG: '139.180.198.3', CA: '142.4.205.77',
}

// ── Install page (iPhone-only landing) ───────────────────────────────────────
function InstallPage() {
  return (
    <div className="install-overlay">
      <div className="install-card">
        <div className="install-icon">
          <svg viewBox="0 0 52 52" fill="none">
            <circle cx="19" cy="19" r="12" stroke="currentColor" strokeWidth="2.8"/>
            <path d="M28 28L40 40" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M14 19h10M19 14v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="install-title">UnFinder</h1>
        <p className="install-sub">Mask your IP. Hide your location. Free, always.</p>

        <div className="install-steps">
          <p className="steps-label">INSTALL ON IPHONE</p>
          <div className="step-row"><span className="step-n">1</span><span>Tap <strong>Share</strong> <span className="chip">⬆️</span> in Safari</span></div>
          <div className="step-row"><span className="step-n">2</span><span>Tap <strong>Add to Home Screen</strong> <span className="chip">＋</span></span></div>
          <div className="step-row"><span className="step-n">3</span><span>Tap <strong>Add</strong> — done</span></div>
        </div>

        <a className="install-done-btn" href="/">
          ✓ I have installed it — Continue
        </a>
        <a className="install-skip-btn" href="/">
          Skip, use in browser
        </a>
      </div>
    </div>
  )
}

// ── VPN App page ──────────────────────────────────────────────────────────────
function VpnApp() {
  const [connected, setConnected]   = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [selected, setSelected]     = useState(LOCATIONS[0])
  const [showPicker, setShowPicker] = useState(false)

  const toggle = () => {
    if (connected) { setConnected(false); return }
    setConnecting(true)
    setTimeout(() => { setConnecting(false); setConnected(true) }, 2000)
  }

  const pick = (loc) => {
    if (connected) setConnected(false)
    setSelected(loc)
    setShowPicker(false)
  }

  return (
    <div className="app">
      <div className={`bg-ring r1 ${connected ? 'active' : ''}`} />
      <div className={`bg-ring r2 ${connected ? 'active' : ''}`} />
      <div className={`bg-ring r3 ${connected ? 'active' : ''}`} />

      <div className="shell">
        <header className="header">
          <div className="wordmark">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 14L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 9h5M9 6.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            UnFinder
          </div>
          <div className={`status-dot ${connected ? 'on' : connecting ? 'pulse' : 'off'}`} />
        </header>

        <div className="ip-block">
          <p className="ip-label">Your IP Address</p>
          <p className={`ip-value ${connected ? 'masked' : ''}`}>
            {connected ? FAKE_IPS[selected.code] : connecting ? '···.···.···.···' : 'Exposed'}
          </p>
          {connected && <div className="ip-badge">🛡 Masked · {selected.city}</div>}
        </div>

        <div className="power-wrap">
          <button
            className={`power-btn ${connected ? 'on' : ''} ${connecting ? 'loading' : ''}`}
            onClick={toggle}
            disabled={connecting}
          >
            <svg className="power-icon" viewBox="0 0 40 40" fill="none">
              <path d="M20 6v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <path d="M11.7 10.3A13 13 0 1 0 28.3 10.3" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="power-label">
              {connecting ? 'Connecting…' : connected ? 'Disconnect' : 'Connect'}
            </span>
          </button>
        </div>

        <button className="location-trigger" onClick={() => setShowPicker(true)}>
          <span className="loc-flag">{selected.flag}</span>
          <span className="loc-name">{selected.city}</span>
          <span className="loc-ping">{selected.ping}ms</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={`stats-row ${connected ? 'visible' : ''}`}>
          <div className="stat"><div className="stat-val">AES-256</div><div className="stat-key">Encryption</div></div>
          <div className="stat-div" />
          <div className="stat"><div className="stat-val">No logs</div><div className="stat-key">Policy</div></div>
          <div className="stat-div" />
          <div className="stat"><div className="stat-val">Free</div><div className="stat-key">Always</div></div>
        </div>
      </div>

      {showPicker && (
        <div className="sheet-overlay" onClick={() => setShowPicker(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Choose Location</p>
            <div className="loc-list">
              {LOCATIONS.map(loc => (
                <button
                  key={loc.code}
                  className={`loc-row ${selected.code === loc.code ? 'active' : ''}`}
                  onClick={() => pick(loc)}
                >
                  <span className="loc-row-flag">{loc.flag}</span>
                  <div className="loc-row-info">
                    <span className="loc-row-city">{loc.city}</span>
                    <span className="loc-row-country">{loc.country}</span>
                  </div>
                  <span className="loc-row-ping">{loc.ping}ms</span>
                  {selected.code === loc.code && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="#4caf7d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  // On iPhone (not standalone), land on /install — everywhere else, land on /
  const defaultRoute = isIPhone() && !isStandalone()
    ? <Navigate to="/install" replace />
    : <SignIn />

  return (
    <Router>
      <Routes>
        <Route path="/"        element={defaultRoute} />
        <Route path="/install" element={<InstallPage />} />
        <Route path="/app"     element={<VpnApp />} />
      </Routes>
    </Router>
  )
}
