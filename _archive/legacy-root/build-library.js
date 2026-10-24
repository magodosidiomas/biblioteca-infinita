const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const parseLine = (line) => {
    const row = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    row.push(cur.trim());
    return row;
  };
  const header = parseLine(lines[0].replace(/^\uFEFF/, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

// 1. Language Definitions
const LANGUAGES = [
  { id: "french", name: "Francês", flag: "🇫🇷", folder: "French", seriesMatch: /Français|French/i },
  { id: "english", name: "Inglês", flag: "🇬🇧", folder: "English", seriesMatch: /English/i },
  { id: "german", name: "Alemão", flag: "🇩🇪", folder: "German", seriesMatch: /Deutsch|Alemão|German/i },
  { id: "spanish", name: "Espanhol", flag: "🇪🇸", folder: "Spanish", seriesMatch: /Español|Spanish/i },
  { id: "italian", name: "Italiano", flag: "🇮🇹", folder: "Italian", seriesMatch: /Italiano|Italian/i },
  { id: "russian", name: "Russo", flag: "🇷🇺", folder: "Russian", seriesMatch: /Russian|Russo/i },
  { id: "japanese", name: "Japonês", flag: "🇯🇵", folder: "Japanese", seriesMatch: /Japanese|Japonês/i },
  { id: "portuguese", name: "Português", flag: "🇧🇷", folder: "Portuguese (BR)", seriesMatch: /Português/i },
  { id: "polish", name: "Polonês", flag: "🇵🇱", folder: "Polish", seriesMatch: /Polish|Polonês/i },
  { id: "ukrainian", name: "Ucraniano", flag: "🇺🇦", folder: "Ukrainian", seriesMatch: /Ukrainian|Ucraniano/i },
  { id: "arabic", name: "Árabe", flag: "🇸🇦", folder: "Arabic", seriesMatch: /Arabic|Árabe/i },
  { id: "latin", name: "Latim", flag: "🏛️", folder: "Latin", seriesMatch: /(?:^|[^\w])(?:Latim|Lingva|Latin)(?!o)/i }
];

// Helper to clean tags
function cleanTag(tag) {
  if (!tag) return '';
  return tag
    .replace(/^[\p{Emoji}\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '')
    .trim();
}

// Helper to get avatar
function getAvatar(url, name) {
  if (!url) {
    return 'https://www.google.com/s2/favicons?domain=notion.so&sz=128';
  }
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      return 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
    }
    if (u.hostname.includes('spotify.com')) {
      return 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128';
    }
    if (u.hostname.includes('netflix.com')) {
      return 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128';
    }
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=128`;
  } catch (e) {
    return 'https://www.google.com/s2/favicons?domain=google.com&sz=128';
  }
}

// Subtitle normalization
function normalizeSubtitles(sub) {
  if (!sub) return undefined;
  if (/dual/i.test(sub)) return 'Legendas bilíngues';
  if (/hardcoded/i.test(sub)) return 'Legendas fixas';
  if (/transcript/i.test(sub)) return 'Com transcrição';
  if (/subtitles available|subs available/i.test(sub)) return 'Legendas [CC]';
  return 'Legendas [CC]';
}

// Load existing avatars & descriptions from french cache if available
let realAvatars = {};
let ytDescriptions = {};
try { realAvatars = JSON.parse(fs.readFileSync('real-avatars.json', 'utf8')); } catch(e){}
try { ytDescriptions = JSON.parse(fs.readFileSync('youtube-descriptions.json', 'utf8')); } catch(e){}

// Parse Central Series
const allFiles = getAllFiles('Notion exports/extracted_new');
const seriesCsv = allFiles.find(f => f.includes('All the Series') && f.endsWith('_all.csv'));
const centralSeriesRows = seriesCsv ? parseCSV(fs.readFileSync(seriesCsv, 'utf8')) : [];

console.log('Central Series rows:', centralSeriesRows.length);

const library = {};

LANGUAGES.forEach(lang => {
  library[lang.id] = {
    YouTube: [],
    Podcasts: [],
    Séries: [],
    Sites: []
  };

  // 1. Find Content CSV for this language
  const langFolder = path.join('Notion exports/extracted_new/Languageflix v 1 0 1', lang.folder);
  if (fs.existsSync(langFolder)) {
    const files = getAllFiles(langFolder);
    const contentCsv = files.find(f => f.includes('Content') && f.endsWith('_all.csv') || f.includes('Conte') && f.endsWith('_all.csv'));
    
    if (contentCsv) {
      const rows = parseCSV(fs.readFileSync(contentCsv, 'utf8'));
      rows.forEach((r, idx) => {
        const name = (r.Name || '').trim();
        const url = (r.Link || r.Website || r.URL || '').trim();
        if (!name) return;

        const rawType = (r.Type || '').toLowerCase();
        const tags = (r.Tags || '')
          .split(',')
          .map(t => cleanTag(t))
          .filter(t => t.length > 0 && !t.includes('Content for learners'));

        const subTag = normalizeSubtitles(r.Subtitles);
        const id = `${lang.id}_${idx}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

        const item = {
          id,
          name,
          url,
          tags: tags.length > 0 ? tags.slice(0, 3) : [],
          subtitleTag: subTag,
          paceTag: 'Fala natural',
          avatar: realAvatars[id] || getAvatar(url, name),
          desc: ytDescriptions[id] || `${name} – Conteúdo selecionado para imersão em ${lang.name}.`
        };

        // Classify format
        if (rawType.includes('youtube') || url.includes('youtube.com') || url.includes('youtu.be')) {
          library[lang.id].YouTube.push(item);
        } else if (rawType.includes('podcast') || url.includes('spotify.com') || url.includes('podcast')) {
          item.transcriptTag = subTag || 'Com áudio';
          library[lang.id].Podcasts.push(item);
        } else {
          // Newspaper, Blog, App, etc. -> Sites
          library[lang.id].Sites.push(item);
        }
      });
    }
  }

  // 2. Add series for this language
  centralSeriesRows.forEach((s, sIdx) => {
    const sName = (s.Name || '').trim();
    if (!sName) return;

    const origLang = s['Original Language'] || '';
    const dubbings = (s['Dubbings'] || '') + ' ' + (s['Dubbings 2'] || '');
    const fullAudioLangs = origLang + ' ' + dubbings;

    if (lang.seriesMatch.test(fullAudioLangs)) {
      const isOriginal = lang.seriesMatch.test(origLang);
      const sId = `${lang.id}_series_${sIdx}_${sName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

      library[lang.id].Séries.push({
        id: sId,
        name: sName,
        url: s.Link || `https://www.google.com/search?q=${encodeURIComponent(sName + ' netflix')}`,
        tags: [isOriginal ? 'Áudio Original' : 'Dublado', 'Série'],
        platformTag: s.Type ? s.Type.replace('Series - ', '') : 'Netflix',
        levelTag: 'B1-B2',
        paceTag: 'Fala natural',
        avatar: getAvatar(s.Link || 'https://www.netflix.com', sName),
        desc: `${sName} disponível com áudio em ${lang.name} (${isOriginal ? 'Original' : 'Dublagem'}).`
      });
    }
  });

  console.log(`Language ${lang.name} (${lang.id}):`, {
    YouTube: library[lang.id].YouTube.length,
    Podcasts: library[lang.id].Podcasts.length,
    Séries: library[lang.id].Séries.length,
    Sites: library[lang.id].Sites.length
  });
});

// Also preserve our rich French items if in french library
try {
  const contentOld = fs.readFileSync('generate-production-app.js', 'utf8');
  const match = contentOld.match(/const channels = (\[[\s\S]*?\]);/);
  if (match) {
    const oldFrench = eval(match[1]);
    const existingUrls = new Set(oldFrench.map(c => c.url));
    library['french'].YouTube = [
      ...oldFrench,
      ...library['french'].YouTube.filter(item => !existingUrls.has(item.url))
    ];
  }
} catch(e) {
  console.error('Error attaching old french:', e.message);
}

// Write the complete library to app/src/data/content.json
fs.writeFileSync('app/src/data/content.json', JSON.stringify(library, null, 2), 'utf8');
console.log('\nSuccessfully generated app/src/data/content.json!');

