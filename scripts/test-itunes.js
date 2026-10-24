const fs = require('fs');

async function testITunes(query) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&entity=podcast&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        console.log('iTunes result for:', query);
        console.log('- Artwork:', item.artworkUrl600 || item.artworkUrl100);
        console.log('- Artist:', item.artistName);
        console.log('- Genres:', item.genres);
      } else {
        console.log('iTunes no result for', query);
      }
    }
  } catch(e) {
    console.error('iTunes error:', e.message);
  }
}

async function run() {
  await testITunes('innerFrench');
  await testITunes('6 Minute English');
  await testITunes('Slow German');
  await testITunes('Luke\'s English Podcast');
}

run();
