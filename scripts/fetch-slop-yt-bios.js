const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const cacheFile = path.join(__dirname, '../cache-youtube.json');
let cache = {};
if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8') || '{}');
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#([0-9]{1,6});/gi, (match, numStr) => {
      const num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
}

function fetchYtMetadata(url) {
  const cleanUrl = url.replace(/\/videos\/?$/, '').replace(/\/+$/, '');
  return new Promise(resolve => {
    const isHttps = cleanUrl.startsWith('https');
    const client = isHttps ? https : http;

    const req = client.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr,de,es,it,ru,pl,uk,ar,pt,en-US,en;q=0.9'
      },
      timeout: 8000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirect = res.headers.location;
        if (!redirect.startsWith('http')) {
          redirect = 'https://www.youtube.com' + redirect;
        }
        return fetchYtMetadata(redirect).then(resolve);
      }
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
        const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
        const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(https:\/\/yt3\.googleusercontent\.com\/[^"]+)"/i);

        let desc = descMatch ? descMatch[1] : (ogDesc ? ogDesc[1] : null);
        if (desc) {
          desc = decodeHtmlEntities(desc).trim();
          // Filter out generic YouTube fallback
          if (desc.toLowerCase().startsWith('share your videos with friends') || desc.toLowerCase().startsWith('enjoy the videos and music you love')) {
            desc = null;
          }
        }
        const avatar = avatarMatch ? avatarMatch[1] : null;
        resolve({ desc, avatar });
      });
    });

    req.on('error', () => resolve({ desc: null, avatar: null }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ desc: null, avatar: null });
    });
  });
}

async function run() {
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, '../app/src/data/content.json'), 'utf8'));

  const slopPatterns = [
    /conteúdo selecionado/i,
    /ótimo para imersão/i,
    /ótimo para aprender/i,
    /canal ideal para/i,
    /excelente canal para/i,
    /para quem quer aprender/i,
    /imersão autêntica/i,
    /recurso excelente/i,
    /selecionado para imersão/i
  ];

  const targetItems = [];
  for (const lang of Object.keys(content)) {
    for (const cat of ['YouTube', 'Educacional']) {
      const items = content[lang][cat] || [];
      for (const item of items) {
        if (slopPatterns.some(p => p.test(item.desc || '')) && (item.url || '').includes('youtube.com')) {
          targetItems.push({ lang, cat, item });
        }
      }
    }
  }

  console.log(`Found ${targetItems.length} YouTube channels with slop descriptions.`);

  // Process in small batches with concurrency
  const batchSize = 6;
  let fetchedCount = 0;

  for (let i = 0; i < targetItems.length; i += batchSize) {
    const chunk = targetItems.slice(i, i + batchSize);
    await Promise.all(chunk.map(async ({ lang, cat, item }) => {
      const u = item.url;
      try {
        const meta = await fetchYtMetadata(u);
        if (meta.desc) {
          console.log(`[OK] ${item.name} (${lang}): ${meta.desc.slice(0, 70)}...`);
          cache[u] = {
            desc: meta.desc,
            avatar: meta.avatar || item.avatar
          };
          fetchedCount++;
        } else {
          console.log(`[NO DESC] ${item.name} (${lang})`);
        }
      } catch (err) {
        console.log(`[ERR] ${item.name}: ${err.message}`);
      }
    }));
  }

  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\nUpdated cache with ${fetchedCount} real YouTube channel descriptions.`);
}

run();
