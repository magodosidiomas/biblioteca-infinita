const fs = require('fs');

async function testItunesLookup() {
  const query = 'Freakonomics Radio';
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&entity=podcast&limit=1`);
  const data = await res.json();
  const item = data.results[0];
  console.log('Result keys:', Object.keys(item));
  console.log('item.feedUrl:', item.feedUrl);
  console.log('item.collectionName:', item.collectionName);

  if (item.feedUrl) {
    try {
      const feedRes = await fetch(item.feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000)
      });
      const text = await feedRes.text();
      // Regex for <itunes:summary> or <description>
      const itunesSummary = text.match(/<itunes:summary>([\s\S]*?)<\/itunes:summary>/i);
      const descMatch = text.match(/<description>([\s\S]*?)<\/description>/i);
      const raw = (itunesSummary && itunesSummary[1]) || (descMatch && descMatch[1]) || '';
      const clean = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim();
      console.log('\nExtracted Podcast description from Feed:');
      console.log(clean.slice(0, 300));
    } catch (e) {
      console.error('Feed fetch error:', e.message);
    }
  }
}

testItunesLookup();
