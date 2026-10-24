const fs = require('fs');

const content = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const seriesEnriched = JSON.parse(fs.readFileSync('scripts/series-enriched.json', 'utf8'));
const notionDir = 'Notion exports/extracted_new/Languageflix v 1 0 1/All the Series/Series - Central';

const LANG_LABELS = {
  english: 'Inglês',
  german: 'Alemão',
  french: 'Francês',
  spanish: 'Espanhol',
  italian: 'Italiano',
  russian: 'Russo',
  japanese: 'Japonês',
  portuguese: 'Português',
  polish: 'Polonês',
  ukrainian: 'Ucraniano',
  arabic: 'Árabe',
  latin: 'Latim',
  korean: 'Coreano',
  chinese: 'Mandarim',
  dutch: 'Holandês',
  swedish: 'Sueco',
  norwegian: 'Norueguês',
  danish: 'Dinamarquês',
  finnish: 'Finlandês',
  turkish: 'Turco',
  greek: 'Grego',
  hebrew: 'Hebraico',
  hindi: 'Hindi',
  vietnamese: 'Vietnamita',
  thai: 'Tailandês',
  indonesian: 'Indonésio',
  czech: 'Tcheco',
  hungarian: 'Húngaro',
  romanian: 'Romeno',
  catalan: 'Catalão',
  croatian: 'Croata',
  esperanto: 'Esperanto'
};

const LABEL_TO_KEY = {
  'english': 'english',
  'english - british': 'english',
  'inglês': 'english',
  'ingles': 'english',
  'german': 'german',
  'deutsch': 'german',
  'alemão': 'german',
  'alemao': 'german',
  'french': 'french',
  'français': 'french',
  'francês': 'french',
  'frances': 'french',
  'spanish': 'spanish',
  'español latino': 'spanish',
  'español europeo': 'spanish',
  'espanhol': 'spanish',
  'italian': 'italian',
  'italiano': 'italian',
  'russian': 'russian',
  'russo': 'russian',
  'japanese': 'japanese',
  'japonês': 'japanese',
  'japones': 'japanese',
  'portuguese': 'portuguese',
  'português': 'portuguese',
  'portugues': 'portuguese',
  'português (br)': 'portuguese',
  'português (pt)': 'portuguese',
  'polish': 'polish',
  'polonês': 'polish',
  'polones': 'polish',
  'ukrainian': 'ukrainian',
  'ucraniano': 'ukrainian',
  'arabic': 'arabic',
  'árabe': 'arabic',
  'arabe': 'arabic',
  'korean': 'korean',
  'coreano': 'korean',
  'chinese': 'chinese',
  'mandarin chinese': 'chinese',
  'cantonese': 'chinese',
  'mandarim': 'chinese',
  'dutch': 'dutch',
  'holandês': 'dutch',
  'swedish': 'swedish',
  'sueco': 'swedish',
  'norwegian': 'norwegian',
  'norueguês': 'norwegian',
  'danish': 'danish',
  'dinamarquês': 'danish',
  'finnish': 'finnish',
  'finlandês': 'finnish',
  'turkish': 'turkish',
  'turco': 'turkish',
  'greek': 'greek',
  'grego': 'greek',
  'hebrew': 'hebrew',
  'hebraico': 'hebrew',
  'hindi': 'hindi',
  'vietnamese': 'vietnamese',
  'viet': 'vietnamese',
  'vietnamita': 'vietnamese',
  'thai': 'thai',
  'tailandês': 'thai',
  'indonesian': 'indonesian',
  'indonésio': 'indonesian',
  'czech': 'czech',
  'tcheco': 'czech',
  'hungarian': 'hungarian',
  'húngaro': 'hungarian',
  'romanian': 'romanian',
  'romeno': 'romanian'
};

function normKey(raw, fallback = 'english') {
  if (!raw) return fallback;
  const clean = String(raw).toLowerCase().trim();
  return LABEL_TO_KEY[clean] || clean;
}

const GENRE_MAP = {
  'drama': 'Drama',
  'comedy': 'Humor',
  'sitcom': 'Sitcom',
  'action': 'Ação',
  'adventure': 'Aventura',
  'science-fiction': 'Ficção Científica',
  'fantasy': 'Fantasia',
  'mystery': 'Mistério',
  'thriller': 'Suspense',
  'crime': 'Policial',
  'romance': 'Romance',
  'animation': 'Animação',
  'anime': 'Animação',
  'family': 'Infantil',
  'children': 'Infantil',
  'history': 'História',
  'documentary': 'Documentário'
};

// Overrides curados cirurgicamente para corrigir colisões de homônimos / animações vs live-action
const CURATED_OVERRIDES = {
  'Avatar: The Legend of Aang': {
    name: 'Avatar: The Last Airbender',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/79/199224.jpg',
    origKey: 'english',
    tags: ['Animação', 'Aventura'],
    beginnerFriendly: true
  },
  'Avatar: The Last Airbender': {
    name: 'Avatar: The Last Airbender',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/79/199224.jpg',
    origKey: 'english',
    tags: ['Animação', 'Aventura'],
    beginnerFriendly: true
  },
  'Avatar: The Legend of Korra': {
    name: 'Avatar: The Legend of Korra',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/260/650489.jpg',
    origKey: 'english',
    tags: ['Animação', 'Aventura'],
    beginnerFriendly: false
  },
  'DC Titans': {
    name: 'DC Titans',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/457/1143752.jpg',
    origKey: 'english',
    tags: ['Ação', 'Ficção Científica'],
    beginnerFriendly: false
  },
  'Family Business': {
    name: 'Family Business',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/271/677998.jpg',
    origKey: 'french',
    tags: ['Humor', 'Drama'],
    beginnerFriendly: false
  },
  'Ultraman': {
    name: 'Ultraman',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/383/958488.jpg',
    origKey: 'japanese',
    tags: ['Animação', 'Ficção Científica'],
    beginnerFriendly: false
  },
  'The Square': {
    name: 'The Square',
    poster: 'https://image.tmdb.org/t/p/w780/oMRyQ4xkqlW8W0HnVMg8IunALUy.jpg',
    origKey: 'arabic',
    tags: ['Documentário', 'História'],
    beginnerFriendly: false
  },
  'Sherlock Holmes BBC': {
    name: 'Sherlock Holmes BBC',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/171/428042.jpg',
    origKey: 'english',
    tags: ['Mistério', 'Policial'],
    beginnerFriendly: false
  },
  'Explained: Our Brain/Mind': {
    name: 'The Mind, Explained',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/373/932569.jpg',
    origKey: 'english',
    tags: ['Documentário', 'Ciência'],
    beginnerFriendly: false
  },
  'Jurassic World: New Adventures': {
    name: 'Jurassic World: Camp Cretaceous',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/374/936975.jpg',
    origKey: 'english',
    tags: ['Animação', 'Aventura'],
    beginnerFriendly: true
  },
  'Trollhunters: Tales of Arcadia': {
    name: 'Trollhunters: Tales of Arcadia',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/78/197449.jpg',
    origKey: 'english',
    tags: ['Animação', 'Fantasia'],
    beginnerFriendly: true
  },
  '3 Below: Tales from Arcadia': {
    name: '3Below: Tales of Arcadia',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/178/445162.jpg',
    origKey: 'english',
    tags: ['Animação', 'Ficção Científica'],
    beginnerFriendly: true
  },
  'Wizards - Tales from Arcadia': {
    name: 'Wizards: Tales of Arcadia',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/264/661684.jpg',
    origKey: 'english',
    tags: ['Animação', 'Fantasia'],
    beginnerFriendly: true
  },
  'Omnipresent': {
    name: 'Onisciente (Omniscient)',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/238/596319.jpg',
    origKey: 'portuguese',
    tags: ['Ficção Científica', 'Suspense'],
    beginnerFriendly: false
  },
  'La Trêve': {
    name: 'La Trêve (The Break)',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/210/526852.jpg',
    origKey: 'french',
    tags: ['Policial', 'Suspense'],
    beginnerFriendly: false
  },
  'La Trêve (The Break)': {
    name: 'La Trêve (The Break)',
    poster: 'https://static.tvmaze.com/uploads/images/original_untouched/210/526852.jpg',
    origKey: 'french',
    tags: ['Policial', 'Suspense'],
    beginnerFriendly: false
  }
};

// Também adicionar Toon (Holandês) que estava no Notion export
seriesEnriched.push({
  name: 'Toon',
  url: 'https://www.netflix.com/title/81064730',
  poster: 'https://static.tvmaze.com/uploads/images/original_untouched/137/343253.jpg',
  tvmazeOrigLang: 'dutch',
  rawGenres: ['Comedy', 'Drama'],
  langs: ['dutch']
});

// Ler os arquivos .md do Notion para pegar todas as dublagens extras (coreano, mandarim, holandês, turco, sueco, etc.)
const notionFiles = fs.readdirSync(notionDir).filter(f => f.endsWith('.md'));
const notionDubsByTitle = {};

notionFiles.forEach(f => {
  const c = fs.readFileSync(notionDir + '/' + f, 'utf8');
  let rawTitle = (c.match(/^#\s+(.*)$/m) || [])[1]?.trim() || f.replace(/\.md$/, '');
  rawTitle = rawTitle.replace(/\s*[–—-]\s*Netflix$/i, '').trim();
  const origRaw = (c.match(/Original Language:\s*([^\r\n]+)/) || [])[1] || '';
  const dubsRaw = (c.match(/Dubbings:\s*([^\r\n]+)/) || [])[1] || '';

  const extract = str => str.split(',').map(s => s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\uFE0F|[^\w\s()À-ÿ-]/g, '').trim()).filter(Boolean);
  const langsSet = new Set();
  extract(origRaw).forEach(x => { const k = LABEL_TO_KEY[x.toLowerCase()]; if (k) langsSet.add(k); });
  extract(dubsRaw).forEach(x => { const k = LABEL_TO_KEY[x.toLowerCase()]; if (k) langsSet.add(k); });

  notionDubsByTitle[rawTitle.toLowerCase()] = Array.from(langsSet);
});

// Preservar Friends e extr@ English que já estavam no content.json em inglês
const preservedManually = [
  {
    id: 'friends_english',
    name: 'Friends',
    url: 'https://www.netflix.com/title/70153404',
    avatar: 'https://image.tmdb.org/t/p/w780/f496cm9enuEsZkSPzCwnTESEK5s.jpg',
    desc: '',
    tags: ['Sitcom', 'Cotidiano'],
    beginnerFriendly: true,
    subtitlesAvailable: true,
    subtitleTag: 'Legendas [CC]',
    platform: 'Netflix',
    originalLanguage: 'english',
    originalLanguageLabel: 'Inglês',
    langs: ['english']
  },
  {
    id: 'extra_english',
    name: 'extr@ English',
    url: 'https://www.youtube.com/playlist?list=PLdYSWqTrWP2jyqWIdjsATbrb11uN_BMrF',
    avatar: 'https://i.ytimg.com/vi/a339HHJ247U/hqdefault.jpg',
    desc: '',
    tags: ['Sitcom', 'Humor'],
    beginnerFriendly: true,
    subtitlesAvailable: true,
    subtitleTag: 'Legendas [CC]',
    platform: 'YouTube',
    originalLanguage: 'english',
    originalLanguageLabel: 'Inglês',
    langs: ['english']
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Limpar todas as listas de 'Séries' em todos os idiomas para reconstruir sem duplicatas ou lixo
for (const lKey of Object.keys(content)) {
  content[lKey]['Séries'] = [];
}

// Unificar seriesEnriched por nome canônico final
const canonicalSeriesMap = {};

seriesEnriched.forEach(item => {
  const override = CURATED_OVERRIDES[item.name];
  const finalName = override ? override.name : item.name;
  const finalPoster = override ? override.poster : item.poster;
  const origKey = override ? override.origKey : normKey(item.tvmazeOrigLang || item.originalLanguage, 'english');
  const origLabel = LANG_LABELS[origKey] || 'Inglês';

  let tags = override ? [...override.tags] : [];
  if (tags.length === 0) {
    (item.rawGenres || []).forEach(g => {
      const mapped = GENRE_MAP[g.toLowerCase()];
      if (mapped && !tags.includes(mapped)) tags.push(mapped);
    });
  }
  if (tags.length === 0) tags.push('Drama');

  const allLangs = new Set(item.langs.map(l => normKey(l)));
  allLangs.add(origKey);

  // Cruzar com Notion dubbings
  const rawLower = item.name.toLowerCase().replace(/\s*\(.*\)/, '').trim();
  const finalLower = finalName.toLowerCase().replace(/\s*\(.*\)/, '').trim();
  (notionDubsByTitle[rawLower] || []).forEach(l => allLangs.add(l));
  (notionDubsByTitle[finalLower] || []).forEach(l => allLangs.add(l));
  (notionDubsByTitle[item.name.toLowerCase()] || []).forEach(l => allLangs.add(l));

  const beginnerFriendly = override && typeof override.beginnerFriendly === 'boolean'
    ? override.beginnerFriendly
    : Boolean(item.tags && (item.tags.includes('Iniciante') || item.tags.includes('A1') || item.tags.includes('A2') || tags.includes('Animação') || tags.includes('Sitcom')));

  if (!canonicalSeriesMap[finalName]) {
    canonicalSeriesMap[finalName] = {
      name: finalName,
      url: item.name === 'La Trêve' ? 'https://www.netflix.com/title/80138988' : item.url,
      poster: finalPoster,
      origKey,
      origLabel,
      tags: tags.slice(0, 2),
      beginnerFriendly,
      platform: 'Netflix',
      langs: allLangs
    };
  } else {
    allLangs.forEach(l => canonicalSeriesMap[finalName].langs.add(l));
  }
});

// Adicionar os preservados manualmente
preservedManually.forEach(p => {
  if (!canonicalSeriesMap[p.name]) {
    canonicalSeriesMap[p.name] = {
      name: p.name,
      url: p.url,
      poster: p.avatar,
      origKey: p.originalLanguage,
      origLabel: p.originalLanguageLabel,
      tags: p.tags,
      beginnerFriendly: p.beginnerFriendly,
      platform: p.platform,
      langs: new Set(p.langs)
    };
  }
});

let totalEntries = 0;

Object.values(canonicalSeriesMap).forEach(s => {
  const baseId = slugify(s.name);
  s.langs.forEach(langKey => {
    if (!LANG_LABELS[langKey]) return;
    if (!content[langKey]) {
      content[langKey] = {
        YouTube: [],
        Podcasts: [],
        Séries: [],
        Professores: [],
        Pronúncia: [],
        Recursos: [],
        Filmes: []
      };
    }
    if (!content[langKey]['Séries']) {
      content[langKey]['Séries'] = [];
    }

    content[langKey]['Séries'].push({
      id: `${baseId}_${langKey}`,
      name: s.name,
      url: s.url,
      avatar: s.poster,
      desc: '',
      tags: s.tags,
      beginnerFriendly: s.beginnerFriendly,
      subtitlesAvailable: true,
      subtitleTag: 'Legendas [CC]',
      platform: s.platform,
      originalLanguage: s.origKey,
      originalLanguageLabel: s.origLabel
    });
    totalEntries++;
  });
});

// Ordenar as séries dentro de cada idioma: primeiro Áudio Original (originalLanguage === langKey), depois Dublados, e dentro de cada grupo A-Z
for (const langKey of Object.keys(content)) {
  if (Array.isArray(content[langKey]['Séries'])) {
    content[langKey]['Séries'].sort((a, b) => {
      const aOrig = a.originalLanguage === langKey ? 1 : 0;
      const bOrig = b.originalLanguage === langKey ? 1 : 0;
      if (bOrig !== aOrig) return bOrig - aOrig;
      return a.name.localeCompare(b.name);
    });
  }
}

fs.writeFileSync('app/src/data/content.json', JSON.stringify(content, null, 2), 'utf8');
console.log(`Rebuilt ${Object.keys(canonicalSeriesMap).length} unique canonical series into ${totalEntries} multilingual entries across ${Object.keys(content).length} languages.`);
