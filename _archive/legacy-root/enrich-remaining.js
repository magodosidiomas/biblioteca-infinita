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

let ytCache = {};
let podcastCache = {};
let seriesCache = {};
let siteCache = {};

try { ytCache = JSON.parse(fs.readFileSync('cache-youtube.json', 'utf8')); } catch (e) {}
try { podcastCache = JSON.parse(fs.readFileSync('cache-podcasts.json', 'utf8')); } catch (e) {}
try { seriesCache = JSON.parse(fs.readFileSync('cache-series.json', 'utf8')); } catch (e) {}
try { siteCache = JSON.parse(fs.readFileSync('cache-sites.json', 'utf8')); } catch (e) {}

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

// ------------------------------------------------------------------
// 1. ENRICH WEBSITES / SITES
// ------------------------------------------------------------------
async function enrichWebsites() {
  console.log('\n=== Enriching Sites & Portals ===');
  const siteList = new Map();
  Object.values(contentData).forEach(lang => {
    if (lang.Sites) {
      lang.Sites.forEach(s => {
        if (s.url && !siteList.has(s.url)) siteList.set(s.url, s);
      });
    }
  });

  const list = Array.from(siteList.values());
  console.log(`Total sites to check: ${list.length}`);

  for (const s of list) {
    if (siteCache[s.url] && siteCache[s.url].desc) continue;

    try {
      const res = await fetch(s.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,de;q=0.8,es;q=0.8,pt;q=0.8'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000)
      });

      const html = await res.text();
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

      let desc = (ogDesc && ogDesc[1]) || (metaDesc && metaDesc[1]) || '';
      let img = ogImg && ogImg[1] ? ogImg[1].replace(/&amp;/g, '&') : null;

      if (desc && desc.length > 20) {
        siteCache[s.url] = {
          desc: decodeHtml(desc),
          avatar: img || siteCache[s.url]?.avatar || null
        };
        console.log(`[Site] ${s.name} -> Got real description`);
      }
    } catch(e) {}
  }

  fs.writeFileSync('cache-sites.json', JSON.stringify(siteCache, null, 2), 'utf8');
}

// ------------------------------------------------------------------
// 2. ENRICH REMAINING SERIES WITH FUZZY SEARCH & TRANSLATIONS
// ------------------------------------------------------------------
const SERIES_QUERY_MAP = {
  'Ursos Sem Curso': 'We Bare Bears',
  'Explained Our Brain Mind': 'The Mind, Explained',
  'Sherlock Holmes BBC': 'Sherlock',
  'Como vender drogas online rápido': 'How to Sell Drugs Online (Fast)',
  'Trollhunter - Parte 1': 'Trollhunters: Tales of Arcadia',
  'Avatar A Lenda de Aang': 'Avatar: The Last Airbender',
  'Avatar The Legend of Aang': 'Avatar: The Last Airbender',
  'Avatar The Legend of Korra': 'The Legend of Korra',
  'Hora de Aventura': 'Adventure Time',
  'Naruto Shippuden': 'Naruto: Shippuden',
  'Hunter vs Hunter': 'Hunter x Hunter',
  'Uma advogada extraordinária': 'Extraordinary Attorney Woo',
  'Os Padrinhos Mágicos': 'The Fairly OddParents',
  'One Piece A Série': 'One Piece',
  'Trolljäger Geschichten aus Arcadia – Netflix': 'Trollhunters: Tales of Arcadia',
  'Toon – Netflix': 'Toon'
};

async function enrichRemainingSeries() {
  console.log('\n=== Enriching Remaining Series ===');
  const seriesNames = new Set();
  Object.values(contentData).forEach(lang => {
    if (lang['Séries']) {
      lang['Séries'].forEach(s => seriesNames.add(s.name));
    }
  });

  for (const name of seriesNames) {
    if (seriesCache[name] && seriesCache[name].avatar && seriesCache[name].desc) continue;

    const query = SERIES_QUERY_MAP[name] || name.replace(/–\s*Netflix/i, '').replace(/–\s*Canal\+/i, '').replace(/\(.*\)/, '').trim();

    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        if (results.length > 0) {
          const show = results[0].show;
          const poster = show.image?.original || show.image?.medium;
          const summary = show.summary?.replace(/<[^>]*>/g, '').trim();
          if (poster || summary) {
            seriesCache[name] = {
              avatar: poster || seriesCache[name]?.avatar || null,
              desc: summary || seriesCache[name]?.desc || null,
              genres: show.genres || []
            };
            console.log(`[Series Fuzzy] ${name} -> Matched: ${show.name}`);
            continue;
          }
        }
      }
    } catch(e) {}
  }

  fs.writeFileSync('cache-series.json', JSON.stringify(seriesCache, null, 2), 'utf8');
}

// ------------------------------------------------------------------
// 3. ENRICH PODCASTS WITH SPECIFIC DESCRIPTIONS
// ------------------------------------------------------------------
const PODCAST_SPECIFIC_DESCS = {
  '6 Minute English BBC': 'Learn and practise useful English vocabulary for everyday situations in just 6 minutes with the BBC World Service.',
  '6 Minute English': 'Learn and practise useful English vocabulary for everyday situations in just 6 minutes with the BBC World Service.',
  'All Ears English': 'Get real American English conversations, natural slang, and business expressions with Lindsay and Michelle. Connection NOT Perfection!',
  'Luke\'s English Podcast': 'Award-winning audio show by British teacher and stand-up comedian Luke Thompson offering insightful, entertaining English learning.',
  'TED Radio Hour (NPR)': 'A journey through fascinating ideas, astonishing inventions, fresh approaches to old problems, and new ways to think and create.',
  'Stuff You Should Know': 'If you\'ve ever wanted to know about champagne, satanism, the Stonewall Uprising, chaos theory, LSD, or Rosa Parks, Josh and Chuck have you covered.',
  'Hidden Brain': 'Shankar Vedantam uses science and storytelling to reveal the unconscious patterns that drive human behavior, shape our choices and direct our relationships.',
  'Real English Conversations': 'Natural, spontaneous English conversations with audio lessons designed to bridge the gap between classroom English and real-world fluency.',
  'Effortless English by A J Hoge': 'Speak English fluently, effortlessly, and automatically with AJ Hoge, author and creator of the Effortless English method.',
  'English in 10 minutes': 'Real conversations between native English speakers at normal speed with complete transcripts and vocabulary guides.',
  'Slow German': 'Der Podcast zum Deutschlernen mit Annik Rubens. Authentisches Deutsch, langsam und deutlich gesprochen zu Themen aus Alltag und Kultur.',
  'Langsam Gesprochene Nachrichten': 'Täglich von Montag bis Samstag: Die Nachrichten der Deutschen Welle in verständlicher Sprache, langsam und klar artikuliert für Deutschlernende.',
  'Top Thema mit Vokabeln': 'Berichte aus aller Welt der Deutschen Welle mit Vokabelangaben und Erklärungen für fortgeschrittene Deutschlernende.',
  'Nachrichtenleicht (Deutschland Funk)': 'Der Wochenrückblick des Deutschlandfunks in einfacher Sprache: Politik, Kultur, Sport und Vermischtes verständlich erklärt.',
  'Easy German': 'Learn German with authentic street interviews and conversations from Berlin. Hosted by Cari, Manuel, and the Easy German team.',
  'Eine Stunde History': 'Der wöchentliche Geschichts-Podcast von Deutschlandfunk Nova über historische Wendepunkte und die Ereignisse, die unsere Gegenwart prägen.',
  'SWR2 Wissen': 'Spannende Recherchen zu Wissenschaft, Geschichte, Gesellschaft und aktuellen Entdeckungen aus der Redaktion des SWR.',
  'Fest & Flauschig': 'Der preisgekrönte Kult-Podcast von Jan Böhmermann und Olli Schulz auf Spotify.',
  'Español con Juan': 'Historias divertidas, explicaciones claras y lenguaje natural para aprender y mejorar tu español con el profesor Juan.',
  'Hoy Hablamos: Podcast diario para aprender español': 'Un podcast diario para aprender español paso a paso hablando de cultura, gramática, noticias y vida cotidiana en España.',
  'Radio Ambulante': 'Podcast narrativo en audio de NPR que cuenta las historias más conmovedoras, insólitas y apasionantes de América Latina.',
  'Notes in Spanish': 'Authentic Spanish conversations and culture lessons with Ben and Marina for intermediate and advanced learners.',
  'Fala Gringo - Learn Portuguese Podcast': 'Podcast para estudantes de português brasileiro com foco em cultura, viagens, diversidade e temas reais do Brasil com Leni.',
  'Learn Japanese from Small Talk': 'Natural and friendly Japanese conversation between native speakers covering everyday life, culture, and slang.'
};

function enrichPodcastsDescriptions() {
  console.log('\n=== Enriching Podcast Descriptions ===');
  Object.entries(PODCAST_SPECIFIC_DESCS).forEach(([name, desc]) => {
    podcastCache[name] = {
      ...(podcastCache[name] || {}),
      desc
    };
  });
  fs.writeFileSync('cache-podcasts.json', JSON.stringify(podcastCache, null, 2), 'utf8');
}

// ------------------------------------------------------------------
// 4. APPLY ALL UPDATES
// ------------------------------------------------------------------
function applyAll() {
  console.log('\n=== Applying everything to app/src/data/content.json ===');
  let siteCount = 0;
  let podcastCount = 0;
  let seriesCount = 0;

  Object.values(contentData).forEach(lang => {
    // Sites
    if (lang.Sites) {
      lang.Sites.forEach(s => {
        const cached = siteCache[s.url];
        if (cached) {
          if (cached.desc) { s.desc = cached.desc; siteCount++; }
          if (cached.avatar && (!s.avatar || s.avatar.includes('google.com/s2/favicons'))) {
            s.avatar = cached.avatar;
          }
        }
      });
    }

    // Podcasts
    if (lang.Podcasts) {
      lang.Podcasts.forEach(p => {
        const cached = podcastCache[p.name];
        if (cached) {
          if (cached.desc) { p.desc = cached.desc; podcastCount++; }
          if (cached.avatar && (!p.avatar || p.avatar.includes('google.com/s2/favicons'))) {
            p.avatar = cached.avatar;
          }
          if (cached.creator && !p.creator) p.creator = cached.creator;
        }
      });
    }

    // Series
    if (lang['Séries']) {
      lang['Séries'].forEach(s => {
        const cached = seriesCache[s.name];
        if (cached) {
          if (cached.desc) { s.desc = cached.desc; seriesCount++; }
          if (cached.avatar && (!s.avatar || s.avatar.includes('google.com/s2/favicons'))) {
            s.avatar = cached.avatar;
          }
        }
      });
    }
  });

  fs.writeFileSync('app/src/data/content.json', JSON.stringify(contentData, null, 2), 'utf8');
  console.log(`Finished:`);
  console.log(`- Sites updated: ${siteCount}`);
  console.log(`- Podcasts updated: ${podcastCount}`);
  console.log(`- Series updated: ${seriesCount}`);
}

async function run() {
  await enrichWebsites();
  await enrichRemainingSeries();
  enrichPodcastsDescriptions();
  applyAll();
}

run();
