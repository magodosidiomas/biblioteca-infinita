const fs = require('fs');

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

const csvData = parseCSV(fs.readFileSync('Notion exports/extracted_new/Languageflix v 1 0 1/All the Series/Series - Central c8741d14a2e34933a8ebcb05b612cb56_all.csv', 'utf8'));

const cleanLang = (raw) => {
  if (!raw) return '';
  let cleaned = raw
    .replace(/^[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
    .trim();
  // Standardize common cases
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

const seriesOrigLangMap = {};
csvData.forEach(r => {
  if (r.Name) {
    seriesOrigLangMap[r.Name] = cleanLang(r['Original Language']);
  }
});

console.log('Original Languages mapped for Central Series:');
console.log(seriesOrigLangMap);
