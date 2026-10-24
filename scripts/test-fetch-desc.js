const https = require('https');

function fetchYtData(url) {
  // If url ends with /videos, strip it to hit main channel page
  const cleanUrl = url.replace(/\/videos\/?$/, '');
  return new Promise(resolve => {
    https.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr,de,en-US,en;q=0.9'
      }
    }, res => {
      // follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'https://www.youtube.com' + redirectUrl;
        }
        return fetchYtData(redirectUrl).then(resolve);
      }
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        resolve({
          desc: descMatch ? descMatch[1] : (ogDesc ? ogDesc[1] : null)
        });
      });
    }).on('error', () => resolve({ desc: null }));
  });
}

(async () => {
  const urls = [
    'https://www.youtube.com/c/IchibanJapan/videos',
    'https://www.youtube.com/c/COLASBIM/videos',
    'https://www.youtube.com/c/FRANCE24/videos',
    'https://www.youtube.com/c/PPWorld/videos',
    'https://www.youtube.com/user/NormanFaitDesVideos/videos'
  ];
  for (const u of urls) {
    const res = await fetchYtData(u);
    console.log(u);
    console.log('  ->', res.desc ? res.desc.slice(0, 100) : 'NONE');
  }
})();
