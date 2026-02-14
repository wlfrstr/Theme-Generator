import { useState } from 'react';
import './App.css';

const API = '/api';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [themes, setThemes] = useState(null);

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
          <h2>Generated themes</h2>
          <div className="grid">
            <ThemeCard title="BaseTheme :: Light" json={themes.baseThemeLight} />
            <ThemeCard title="BaseTheme :: Dark" json={themes.baseThemeDark} />
            <ThemeCard title="InquiryTheme :: Light" json={themes.inquiryThemeLight} />
            <ThemeCard title="InquiryTheme :: Dark" json={themes.inquiryThemeDark} />
          </div>
        </section>
      )}
    </div>
  );
}

function ThemeCard({ title, json }) {
  const [copied, setCopied] = useState(false);
  const str = JSON.stringify(json, null, 2);

  async function copy() {
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <button type="button" className="copy-btn" onClick={copy} aria-label="Copy JSON">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="json">{str}</pre>
    </div>
  );
}
