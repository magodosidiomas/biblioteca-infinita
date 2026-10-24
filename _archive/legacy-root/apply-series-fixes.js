const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const seriesFixes = JSON.parse(fs.readFileSync('series-fixes.json', 'utf8'));

// Extract orig languages map from Central CSV
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

const cleanLang = (raw) => {
  if (!raw) return '';
  let cleaned = raw
    .replace(/^[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
    .trim();
  if (cleaned.includes('English - British') || cleaned.includes('English')) return 'Inglês';
  if (cleaned.includes('Français')) return 'Francês';
  if (cleaned.includes('Italiano')) return 'Italiano';
  if (cleaned.includes('Japanese')) return 'Japonês';
  if (cleaned.includes('Português')) return 'Português';
  if (cleaned.includes('Deutsch')) return 'Alemão';
  if (cleaned.includes('Español')) return 'Espanhol';
  if (cleaned.includes('Russian')) return 'Russo';
  if (cleaned.includes('Arabic')) return 'Árabe';
  if (cleaned.includes('Dutch')) return 'Holandês';
  return cleaned;
};

const csvData = parseCSV(fs.readFileSync('Notion exports/extracted_new/Languageflix v 1 0 1/All the Series/Series - Central c8741d14a2e34933a8ebcb05b612cb56_all.csv', 'utf8'));
const seriesOrigLangMap = {};
csvData.forEach(r => {
  if (r.Name) {
    seriesOrigLangMap[r.Name] = cleanLang(r['Original Language']);
  }
});

let updatedSinopses = 0;
let updatedAvatars = 0;
let updatedTags = 0;
let origLangCount = 0;

Object.entries(contentData).forEach(([lang, formats]) => {
  if (formats['Séries']) {
    formats['Séries'].forEach(s => {
      // 1. Remove redundant tag "Série"
      if (s.tags && s.tags.includes('Série')) {
        s.tags = s.tags.filter(t => t !== 'Série');
        updatedTags++;
      }

      // 2. Set originalLanguage field
      const orig = seriesOrigLangMap[s.name];
      if (orig) {
        s.originalLanguage = orig;
        origLangCount++;
      }

      // 3. Fix the 8 series with missing synopsis / avatar
      const fix = seriesFixes[s.name];
      if (fix) {
        if (fix.desc && (s.desc.includes('disponível com áudio') || s.desc.includes('disponivel com audio') || s.desc.length < 30)) {
          s.desc = fix.desc;
          updatedSinopses++;
        }
        if (fix.avatar && (!s.avatar || s.avatar.includes('google.com/s2/favicons'))) {
          s.avatar = fix.avatar;
          updatedAvatars++;
        }
      }
    });
  }
});

fs.writeFileSync('app/src/data/content.json', JSON.stringify(contentData, null, 2), 'utf8');

console.log('Update Complete:');
console.log(`- Series tags cleaned (removed "Série"): ${updatedTags}`);
console.log(`- Series mapped with originalLanguage: ${origLangCount}`);
console.log(`- Sinopses updated from TVmaze: ${updatedSinopses}`);
console.log(`- Avatars updated from TVmaze: ${updatedAvatars}`);
