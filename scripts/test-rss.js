const fs = require('fs');

async function testPodcastRss() {
  const res = await fetch(`https://itunes.apple.com/search?term=Slow+German&media=podcast&entity=podcast&limit=1`);
  const data = await res.json();
  const feedUrl = data.results[0]?.feedUrl;
  console.log('Slow German feedUrl:', feedUrl);
  if (feedUrl) {
    const rssRes = await fetch(feedUrl, { signal: AbortSignal.timeout(6000) });
    const xml = await rssRes.text();
    const descMatch = xml.match(/<description>([\s\S]*?)<\/description>/i) || xml.match(/<itunes:summary>([\s\S]*?)<\/itunes:summary>/i);
    console.log('RSS description:', descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim().slice(0, 150) : 'NOT FOUND');
  }
}

testPodcastRss();
