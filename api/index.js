const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://hlsyjaszrzjdxxecxlrx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3lqYXN6cnpqZHh4ZWN4bHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTcwMjEsImV4cCI6MjEwNDc5MzAyMX0.lsxaNfs_RVxf9pxpcO7X2lXeEyKhjG6GMBV7ls0EDus';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = async (req, res) => {
  try {
    const htmlPath = path.join(process.cwd(), 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Determine host
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'andika-rezkianita.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    // Default metadata
    let ogTitle = 'The Wedding of Andika & Rezki — Undangan Pernikahan';
    let ogDesc = 'Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami: Muhammad Andik & Rezkianita.';
    let ogUrl = `${origin}/`;
    let ogImage = `${origin}/api/og-image`;

    // 1. Fetch live config from Supabase
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/config?key=eq.og&select=value`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0].value) {
          const val = data[0].value;
          if (val.title) ogTitle = val.title;
          if (val.description) ogDesc = val.description;
          if (val.url) ogUrl = val.url;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch error in index handler:', e);
    }

    // 2. Personalize if ?to= is present
    const recipient = req.query && req.query.to ? String(req.query.to).trim() : '';
    if (recipient) {
      ogTitle = `Kepada Yth. ${recipient} — ${ogTitle}`;
      ogDesc = `Kepada Yth. ${recipient}, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami.`;
      ogUrl = `${origin}/?to=${encodeURIComponent(recipient)}`;
    }

    // 3. Inject Dynamic Meta Tags into HTML
    const safeTitle = escapeHtml(ogTitle);
    const safeDesc = escapeHtml(ogDesc);
    const safeUrl = escapeHtml(ogUrl);
    const safeImage = escapeHtml(ogImage);

    // Replace Title & Description in head
    html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
    html = html.replace(/<meta name="title" content=".*?">/i, `<meta name="title" content="${safeTitle}">`);
    html = html.replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${safeDesc}">`);

    // Replace Open Graph Tags
    html = html.replace(/<meta property="og:title" content=".*?">/i, `<meta property="og:title" content="${safeTitle}">`);
    html = html.replace(/<meta property="og:description" content=".*?">/i, `<meta property="og:description" content="${safeDesc}">`);
    html = html.replace(/<meta property="og:url" content=".*?">/i, `<meta property="og:url" content="${safeUrl}">`);
    html = html.replace(/<meta property="og:image" content=".*?">/i, `<meta property="og:image" content="${safeImage}">`);
    html = html.replace(/<meta property="og:image:secure_url" content=".*?">/i, `<meta property="og:image:secure_url" content="${safeImage}">`);

    // Replace Twitter Tags
    html = html.replace(/<meta name="twitter:title" content=".*?">/i, `<meta name="twitter:title" content="${safeTitle}">`);
    html = html.replace(/<meta name="twitter:description" content=".*?">/i, `<meta name="twitter:description" content="${safeDesc}">`);
    html = html.replace(/<meta name="twitter:url" content=".*?">/i, `<meta name="twitter:url" content="${safeUrl}">`);
    html = html.replace(/<meta name="twitter:image" content=".*?">/i, `<meta name="twitter:image" content="${safeImage}">`);
    html = html.replace(/<link rel="image_src" href=".*?">/i, `<link rel="image_src" href="${safeImage}">`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (err) {
    console.error('index handler error:', err);
    // Ultimate fallback: serve raw index.html
    try {
      const fallbackHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(fallbackHtml);
    } catch (e) {
      return res.status(500).send('Internal Server Error');
    }
  }
};
