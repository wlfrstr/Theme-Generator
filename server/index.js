import express from 'express';
import { analyzeUrl } from './analyzeCss.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('dist'));

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/analyze', async (req, res) => {
  const url = req.body?.url?.trim();
  if (!url) {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'URL must be http or https' });
  }

  try {
    const themes = await analyzeUrl(url);
    return res.json(themes);
  } catch (e) {
    console.error('Analyze error:', e.message);
    return res.status(502).json({
      error: 'Failed to fetch or analyze the URL. The site may block automated requests.',
      detail: e.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Theme Generator server at http://localhost:${PORT}`);
});
