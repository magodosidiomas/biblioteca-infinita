const fs = require('fs');

async function testItunesExact(name) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&media=podcast&entity=podcast&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        let desc = '';
        if (item.feedUrl) {
          try {
            const feedRes = await fetch(item.feedUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(6000)
            });
            const text = await feedRes.text();
            const itunesSummary = text.match(/<itunes:summary>([\s\S]*?)<\/itunes:summary>/i);
            const descMatch = text.match(/<description>([\s\S]*?)<\/description>/i);
            const raw = (itunesSummary && itunesSummary[1]) || (descMatch && descMatch[1]) || '';
            desc = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim();
          } catch(e){}
        }
        return {
          title: item.collectionName,
          artist: item.artistName,
          artwork: item.artworkUrl600,
          desc: desc.slice(0, 180)
        };
      }
    }
  } catch(e){}
  return null;
}

async function run() {
  const tests = [
    'The Joe Rogan Experience',
    'The Tim Ferris Show',
    'Business Wars',
    'Fest & Flauschig',
    'Tagesschau',
    'Lage der Nation',
    'Radio Ambulante'
  ];

  for (const t of tests) {
    const res = await testItunesExact(t);
    console.log(t, '->', res);
  }
}

run();
