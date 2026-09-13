const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://hlsyjaszrzjdxxecxlrx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3lqYXN6cnpqZHh4ZWN4bHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTcwMjEsImV4cCI6MjEwNDc5MzAyMX0.lsxaNfs_RVxf9pxpcO7X2lXeEyKhjG6GMBV7ls0EDus';

module.exports = async (req, res) => {
  try {
    // 1. Fetch OG config from Supabase
    let ogImage = '';
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
        if (data && data.length > 0 && data[0].value && data[0].value.image) {
          ogImage = data[0].value.image;
        }
      }
    } catch (e) {
      console.warn('Supabase fetch error in og-image:', e);
    }

    // 2. If ogImage is Base64
    if (ogImage && ogImage.startsWith('data:image/')) {
      const parts = ogImage.split(';base64,');
      const mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      const buffer = Buffer.from(parts[1], 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
      return res.status(200).send(buffer);
    }

    // 3. If ogImage is a standard HTTP/HTTPS URL
    if (ogImage && (ogImage.startsWith('http://') || ogImage.startsWith('https://'))) {
      return res.redirect(302, ogImage);
    }

    // 4. Default fallback: serve local file or redirect to static asset
    const fallbackPath = path.join(process.cwd(), 'assets', 'images', 'og-thumbnail.jpg');
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return res.status(200).send(buffer);
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'andikareskianita.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return res.redirect(302, `${proto}://${host}/assets/images/og-thumbnail.jpg`);
  } catch (err) {
    console.error('og-image error:', err);
    res.status(500).send('Internal Server Error');
  }
};
