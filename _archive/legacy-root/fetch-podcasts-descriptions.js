const https = require('https');
const fs = require('fs');

const shows = [
  { id: 'innerfrench', url: 'https://open.spotify.com/show/00h8GrMQbmSAfiNWYPLvhx' },
  { id: 'transfert', url: 'https://open.spotify.com/show/3XPodkSe4nnc54Jqs8iiwz' },
  { id: 'emotions', url: 'https://open.spotify.com/show/1D9CDBNZLICRUB6Z8i6sO2' },
  { id: 'hugodecrypte', url: 'https://open.spotify.com/show/6y1PloEyNsCNJH9vHias4T' },
  { id: 'choses_a_savoir', url: 'https://open.spotify.com/show/3AL8eKPHOUINc6usVSbRo3' },
  { id: 'heure_du_monde', url: 'https://open.spotify.com/show/2ceI3IzPwHJywfQTAtrQSI' }
];

function decodeEntities(encodedString) {
  return encodedString
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

async function fetchDesc(show) {
  return new Promise((resolve) => {
    https.get(show.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ogMatch = data.match(/<meta property="og:description" content="([^"]+)"/i) || data.match(/<meta name="description" content="([^"]+)"/i);
        resolve({ id: show.id, desc: ogMatch ? decodeEntities(ogMatch[1]) : null });
      });
    }).on('error', () => resolve({ id: show.id, desc: null }));
  });
}

(async () => {
  const results = await Promise.all(shows.map(fetchDesc));
  console.log(JSON.stringify(results, null, 2));
  
  const podcasts = JSON.parse(fs.readFileSync('podcasts-data.json', 'utf-8'));
  for (const p of podcasts) {
    const found = results.find(r => r.id === p.id);
    if (found && found.desc) {
      p.desc = found.desc;
    }
  }
  fs.writeFileSync('podcasts-data.json', JSON.stringify(podcasts, null, 2));
  console.log('Updated podcasts-data.json successfully');
})();
