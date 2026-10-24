const fs = require('fs');

async function testExtractPodcastDirect(pName, pUrl) {
  // If URL is Spotify show
  const spotifyMatch = pUrl.match(/open\.spotify\.com\/show\/([a-zA-Z0-9]+)/);
  if (spotifyMatch) {
    try {
      const res = await fetch(pUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      console.log(`[Spotify] ${pName}:`);
      console.log('  desc:', (ogDesc && ogDesc[1]) || (metaDesc && metaDesc[1]));
      console.log('  img: ', ogImg && ogImg[1]);
      return;
    } catch(e) {
      console.log(`[Spotify Error] ${pName}:`, e.message);
    }
  }

  // Fallback to iTunes API + feedUrl
  try {
    const cleanQuery = pName.replace(/\(.*\)/, '').replace(/[-–].*$/, '').trim();
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=podcast&entity=podcast&limit=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      let feedDesc = '';
      if (item.feedUrl) {
        try {
          const feedRes = await fetch(item.feedUrl, { signal: AbortSignal.timeout(6000) });
          const text = await feedRes.text();
          const itunesSummary = text.match(/<itunes:summary>([\s\S]*?)<\/itunes:summary>/i);
          const descMatch = text.match(/<description>([\s\S]*?)<\/description>/i);
          const raw = (itunesSummary && itunesSummary[1]) || (descMatch && descMatch[1]) || '';
          feedDesc = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').trim();
        } catch(e){}
      }
      console.log(`[iTunes] ${pName}:`);
      console.log('  artist:', item.artistName);
      console.log('  desc:  ', feedDesc?.slice(0, 150));
      console.log('  art:   ', item.artworkUrl600);
    }
  } catch(e) {
    console.log(`[iTunes Error] ${pName}:`, e.message);
  }
}

async function run() {
  await testExtractPodcastDirect('The Joe Rogan Experience', 'https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk');
  await testExtractPodcastDirect('Freakonomics', 'https://freakonomics.com/');
  await testExtractPodcastDirect('Stuff you missed in history class', 'https://www.iheart.com/podcast/stuff-you-missed-in-history-cl-21124503/');
  await testExtractPodcastDirect('Planet Money', 'https://www.npr.org/podcasts/510289/planet-money');
}

run();
