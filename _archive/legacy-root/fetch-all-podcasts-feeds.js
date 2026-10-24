const fs = require('fs');

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

let podcastRealData = {};
try { podcastRealData = JSON.parse(fs.readFileSync('podcasts-real-data.json', 'utf8')); } catch (e) {}

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const podcastNames = new Set();
Object.values(contentData).forEach(lang => {
  if (lang.Podcasts) {
    lang.Podcasts.forEach(p => podcastNames.add(p.name));
  }
});

const list = Array.from(podcastNames);
console.log(`Starting real podcast feed scraper for ${list.length} shows...`);

async function fetchPodcastFeed(name) {
  if (podcastRealData[name] && podcastRealData[name].desc && podcastRealData[name].desc.length > 30) {
    return podcastRealData[name];
  }

  const cleanQuery = name.replace(/\(.*\)/, '').replace(/[-–].*$/, '').trim();

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=podcast&entity=podcast&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        let feedDesc = '';

        if (item.feedUrl) {
          try {
            const feedRes = await fetch(item.feedUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              signal: AbortSignal.timeout(6000)
            });
            const text = await feedRes.text();
            const itunesSummary = text.match(/<itunes:summary>([\s\S]*?)<\/itunes:summary>/i);
            const descMatch = text.match(/<description>([\s\S]*?)<\/description>/i);
            const itunesSubtitle = text.match(/<itunes:subtitle>([\s\S]*?)<\/itunes:subtitle>/i);
            const raw = (itunesSummary && itunesSummary[1]) || (descMatch && descMatch[1]) || (itunesSubtitle && itunesSubtitle[1]) || '';
            feedDesc = decodeHtml(raw);
          } catch(e) {}
        }

        const result = {
          name,
          artist: item.artistName || '',
          artwork: item.artworkUrl600 || item.artworkUrl100 || '',
          desc: feedDesc.slice(0, 300)
        };
        podcastRealData[name] = result;
        return result;
      }
    }
  } catch(e) {}

  return null;
}

async function run() {
  let index = 0;
  async function worker() {
    while (index < list.length) {
      const cur = list[index++];
      try {
        const res = await fetchPodcastFeed(cur);
        if (res && res.desc) {
          console.log(`[Got Feed] ${cur} -> ${res.desc.slice(0, 80)}...`);
        } else {
          console.log(`[No feed desc] ${cur}`);
        }
      } catch(e) {}
    }
  }

  const workers = Array.from({ length: 6 }, () => worker());
  await Promise.all(workers);
  fs.writeFileSync('podcasts-real-data.json', JSON.stringify(podcastRealData, null, 2), 'utf8');
  console.log('Saved podcasts-real-data.json!');
}

run();
