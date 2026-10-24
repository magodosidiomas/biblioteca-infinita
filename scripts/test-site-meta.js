const fs = require('fs');

async function testFetchMeta(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,de;q=0.8,es;q=0.8'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(6000)
    });
    const html = await res.text();
    const ogDesc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
    const metaDesc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
    const ogImg = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
    return { desc: ogDesc || metaDesc, img: ogImg };
  } catch(e) {
    return { error: e.message };
  }
}

async function run() {
  const sites = [
    'https://www.arte.tv/fr/',
    'https://www.lemonde.fr/',
    'https://www.spiegel.de/',
    'https://elpais.com/'
  ];
  for (const s of sites) {
    const res = await testFetchMeta(s);
    console.log(s, '-> desc:', res.desc?.slice(0, 100), '| img:', res.img?.slice(0, 60));
  }
}

run();
