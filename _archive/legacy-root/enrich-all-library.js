const fs = require('fs');

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cache files
let ytCache = {};
let podcastCache = {};
let seriesCache = {};
let siteCache = {};

try { ytCache = JSON.parse(fs.readFileSync('cache-youtube.json', 'utf8')); } catch (e) {}
try { podcastCache = JSON.parse(fs.readFileSync('cache-podcasts.json', 'utf8')); } catch (e) {}
try { seriesCache = JSON.parse(fs.readFileSync('cache-series.json', 'utf8')); } catch (e) {}
try { siteCache = JSON.parse(fs.readFileSync('cache-sites.json', 'utf8')); } catch (e) {}

// Load content.json
const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

// -------------------------------------------------------------
// 1. ENRICH SERIES VIA TVMAZE & WIKIPEDIA
// -------------------------------------------------------------
async function enrichSeries() {
  console.log('\n=== Enriching Series (TVMaze + Wikipedia) ===');
  const seriesNames = new Set();
  Object.values(contentData).forEach(lang => {
    if (lang['Séries']) {
      lang['Séries'].forEach(s => seriesNames.add(s.name));
    }
  });

  for (const name of seriesNames) {
    if (seriesCache[name] && seriesCache[name].avatar && seriesCache[name].desc) {
      continue;
    }

    // Clean name (e.g., "Brooklyn Nine-Nine – Netflix" -> "Brooklyn Nine-Nine")
    const cleanName = name.replace(/–\s*Netflix/i, '').replace(/–\s*Canal\+/i, '').trim();

    try {
      // 1. Try TVMaze
      const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanName)}`);
      if (res.ok) {
        const data = await res.json();
        const poster = data.image?.original || data.image?.medium;
        const summary = data.summary?.replace(/<[^>]*>/g, '').trim();
        if (poster || summary) {
          seriesCache[name] = {
            avatar: poster || null,
            desc: summary || null,
            genres: data.genres || []
          };
          console.log(`[Series TVMaze] ${name} -> Got poster & summary`);
          continue;
        }
      }
    } catch (e) {}

    try {
      // 2. Fallback Wikipedia
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName + ' (TV series)')}`);
      if (wikiRes.ok) {
        const data = await wikiRes.json();
        seriesCache[name] = {
          avatar: data.thumbnail?.source || null,
          desc: data.extract || null
        };
        console.log(`[Series Wiki] ${name} -> Got summary`);
      }
    } catch (e) {}
  }

  fs.writeFileSync('cache-series.json', JSON.stringify(seriesCache, null, 2), 'utf8');
}

// -------------------------------------------------------------
// 2. ENRICH PODCASTS VIA ITUNES SEARCH API
// -------------------------------------------------------------
async function enrichPodcasts() {
  console.log('\n=== Enriching Podcasts (iTunes API) ===');
  const podcastList = new Map();
  Object.values(contentData).forEach(lang => {
    if (lang.Podcasts) {
      lang.Podcasts.forEach(p => {
        if (!podcastList.has(p.name)) podcastList.set(p.name, p);
      });
    }
  });

  for (const [name, p] of podcastList.entries()) {
    if (podcastCache[name] && podcastCache[name].avatar) {
      continue;
    }

    // Clean name for search
    const cleanQuery = name.replace(/\(.*\)/, '').replace(/[-–].*$/, '').trim();

    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=podcast&entity=podcast&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const item = data.results[0];
          podcastCache[name] = {
            avatar: item.artworkUrl600 || item.artworkUrl100,
            creator: item.artistName,
            desc: podcastCache[name]?.desc || `${name} – Podcast em áudio com foco em conteúdo de alta qualidade e audição autêntica.`
          };
          console.log(`[Podcast iTunes] ${name} -> Artwork found: ${item.artistName}`);
        }
      }
    } catch (e) {}
  }

  fs.writeFileSync('cache-podcasts.json', JSON.stringify(podcastCache, null, 2), 'utf8');
}

// -------------------------------------------------------------
// 3. ENRICH YOUTUBE CHANNELS (AVATARS & DESCRIPTIONS)
// -------------------------------------------------------------
function getFetchUrls(url) {
  const urls = [url];
  const cMatch = url.match(/youtube\.com\/c\/([^\/?#]+)/i);
  if (cMatch) urls.push(`https://www.youtube.com/@${cMatch[1]}`);
  const root = url.replace(/\/(videos|featured|playlists|search)\/?.*$/i, '');
  if (root !== url) {
    urls.push(root);
    const cMatch2 = root.match(/youtube\.com\/c\/([^\/?#]+)/i);
    if (cMatch2) urls.push(`https://www.youtube.com/@${cMatch2[1]}`);
  }
  return [...new Set(urls)];
}

async function enrichYouTube() {
  console.log('\n=== Enriching YouTube Channels (Avatars + Real Descriptions) ===');
  const ytList = new Map();
  Object.values(contentData).forEach(lang => {
    if (lang.YouTube) {
      lang.YouTube.forEach(ch => {
        if (ch.url && (ch.url.includes('youtube.com') || ch.url.includes('youtu.be'))) {
          if (!ytList.has(ch.url)) ytList.set(ch.url, ch);
        }
      });
    }
  });

  const list = Array.from(ytList.values());
  console.log(`Total channels to check: ${list.length}`);

  let index = 0;
  let enrichedCount = 0;

  async function worker() {
    while (index < list.length) {
      const ch = list[index++];
      if (ytCache[ch.url] && ytCache[ch.url].avatar && ytCache[ch.url].desc) {
        continue;
      }

      const tryUrls = getFetchUrls(ch.url);
      let foundAvatar = ytCache[ch.url]?.avatar || null;
      let foundDesc = ytCache[ch.url]?.desc || null;

      for (const targetUrl of tryUrls) {
        if (foundAvatar && foundDesc) break;
        try {
          const res = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,de;q=0.7,es;q=0.7'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(6000)
          });

          const html = await res.text();
          if (!foundAvatar) {
            const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
            if (ogImg && ogImg[1] && !ogImg[1].includes('favicon')) {
              foundAvatar = ogImg[1].replace(/&amp;/g, '&');
            } else {
              const yt3 = html.match(/(https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)/);
              if (yt3 && yt3[1]) foundAvatar = yt3[1];
            }
          }

          if (!foundDesc) {
            const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
            const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
            const d = (ogDesc && ogDesc[1]) || (metaDesc && metaDesc[1]) || '';
            if (d && !d.includes('Enjoy the videos and music you love') && !d.includes('YouTube') && d.length > 15) {
              foundDesc = decodeHtml(d);
            }
          }
        } catch (e) {}
      }

      // If it's a specific video link, get thumbnail
      if (!foundAvatar) {
        const vMatch = ch.url.match(/(?:watch\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
        if (vMatch) foundAvatar = `https://i.ytimg.com/vi/${vMatch[1]}/hqdefault.jpg`;
      }

      ytCache[ch.url] = {
        avatar: foundAvatar || ytCache[ch.url]?.avatar || null,
        desc: foundDesc || ytCache[ch.url]?.desc || null
      };

      enrichedCount++;
      if (enrichedCount % 25 === 0) {
        console.log(`[YouTube Progress] Processed ${enrichedCount}/${list.length} channels...`);
        fs.writeFileSync('cache-youtube.json', JSON.stringify(ytCache, null, 2), 'utf8');
      }
    }
  }

  const workers = Array.from({ length: 8 }, () => worker());
  await Promise.all(workers);
  fs.writeFileSync('cache-youtube.json', JSON.stringify(ytCache, null, 2), 'utf8');
  console.log(`YouTube enrichment completed.`);
}

// -------------------------------------------------------------
// 4. APPLY EVERYTHING TO app/src/data/content.json
// -------------------------------------------------------------
function applyAll() {
  console.log('\n=== Applying all enriched metadata to content.json ===');
  let ytUpdated = 0;
  let podcastUpdated = 0;
  let seriesUpdated = 0;

  Object.values(contentData).forEach(lang => {
    // YouTube
    if (lang.YouTube) {
      lang.YouTube.forEach(ch => {
        const cached = ytCache[ch.url];
        if (cached) {
          if (cached.avatar && cached.avatar !== ch.avatar) {
            ch.avatar = cached.avatar;
          }
          if (cached.desc && (!ch.desc || ch.desc.includes('Conteúdo selecionado para imersão'))) {
            ch.desc = cached.desc;
            ytUpdated++;
          }
        }
      });
    }

    // Podcasts
    if (lang.Podcasts) {
      lang.Podcasts.forEach(p => {
        const cached = podcastCache[p.name];
        if (cached) {
          if (cached.avatar) p.avatar = cached.avatar;
          if (cached.creator && !p.creator) p.creator = cached.creator;
          if (cached.desc && (!p.desc || p.desc.includes('Conteúdo selecionado para imersão'))) {
            p.desc = cached.desc;
          }
          podcastUpdated++;
        }
      });
    }

    // Series
    if (lang['Séries']) {
      lang['Séries'].forEach(s => {
        const cached = seriesCache[s.name];
        if (cached) {
          if (cached.avatar) s.avatar = cached.avatar;
          if (cached.desc) s.desc = cached.desc;
          seriesUpdated++;
        }
      });
    }
  });

  fs.writeFileSync('app/src/data/content.json', JSON.stringify(contentData, null, 2), 'utf8');
  console.log('Finished updating content.json:');
  console.log(`- YouTube channel descriptions updated: ${ytUpdated}`);
  console.log(`- Podcast shows enriched: ${podcastUpdated}`);
  console.log(`- Series posters & synopsis enriched: ${seriesUpdated}`);
}

async function main() {
  await enrichSeries();
  await enrichPodcasts();
  await enrichYouTube();
  applyAll();
}

main();
