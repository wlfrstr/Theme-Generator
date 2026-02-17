import { useState, useMemo } from 'react';
import './App.css';

const API = '/api';

function buildThemeSet(themes, themeSetName) {
  return {
    ThemeSet: { name: themeSetName || 'Persona default theme' },
    BaseTheme: [
      { type: 'BaseTheme::Light', styles_json: themes.baseThemeLight },
      { type: 'BaseTheme::Dark', styles_json: themes.baseThemeDark },
    ],
    InquiryTheme: [
      { type: 'InquiryTheme::Light', styles_json: themes.inquiryThemeLight },
      { type: 'InquiryTheme::Dark', styles_json: themes.inquiryThemeDark },
    ],
    ThemeSetThemeVariable: [],
    ThemeVariables: [],
    AllThemeVariables: [],
  };
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [themes, setThemes] = useState(null);
  const [themeSetName, setThemeSetName] = useState('Persona default theme');

  const themeSet = useMemo(() => {
    if (!themes) return null;
    return buildThemeSet(themes, themeSetName);
  }, [themes, themeSetName]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    setThemes(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Request failed');
        return;
      }
      setThemes(data);
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Theme Generator</h1>
        <p className="tagline">
          Enter a website URL to analyze its CSS and generate BaseTheme and InquiryTheme JSON (Light & Dark).
        </p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="input"
          disabled={loading}
          autoFocus
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze CSS'}
        </button>
      </form>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {themes && (
        <section className="output" aria-label="Generated themes">
          {/* Primary: ThemeSet format */}
          <div className="theme-set-section">
            <label className="theme-set-name-label">
              Theme set name
              <input
                type="text"
                className="theme-set-name-input"
                value={themeSetName}
                onChange={(e) => setThemeSetName(e.target.value)}
                placeholder="Persona default theme"
              />
            </label>
            <ThemeSetCard themeSet={themeSet} />
          </div>

          {/* Minimised individual themes */}
          <details className="individual-themes-details">
            <summary className="individual-themes-summary">Individual themes (expand to view or copy)</summary>
            <div className="individual-themes-grid">
              <CollapsibleThemeCard title="BaseTheme :: Light" json={themes.baseThemeLight} />
              <CollapsibleThemeCard title="BaseTheme :: Dark" json={themes.baseThemeDark} />
              <CollapsibleThemeCard title="InquiryTheme :: Light" json={themes.inquiryThemeLight} />
              <CollapsibleThemeCard title="InquiryTheme :: Dark" json={themes.inquiryThemeDark} />
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

function ThemeSetCard({ themeSet }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const str = themeSet ? JSON.stringify(themeSet, null, 4) : '';

  async function copy(e) {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="card card-primary">
      <div className="card-header card-header-primary">
        <button
          type="button"
          className="card-collapsible-trigger card-primary-trigger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="card-collapsible-chevron">{open ? '▼' : '▶'}</span>
          <h2 className="card-title-primary">ThemeSet (full output)</h2>
        </button>
        <button type="button" className="copy-btn copy-btn-primary" onClick={copy} aria-label="Copy ThemeSet JSON">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {open && <pre className="json json-primary">{str}</pre>}
    </div>
  );
}

function CollapsibleThemeCard({ title, json }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const str = JSON.stringify(json, null, 2);

  async function copy(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="card card-collapsible">
      <div className="card-header card-header-collapsible">
        <button
          type="button"
          className="card-collapsible-trigger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="card-collapsible-chevron">{open ? '▼' : '▶'}</span>
          <h3>{title}</h3>
        </button>
        <button type="button" className="copy-btn" onClick={copy} aria-label={`Copy ${title}`}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {open && (
        <pre className="json json-collapsible">{str}</pre>
      )}
    </div>
  );
}
