const fs = require('fs');
const path = require('path');

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

const series = parseCSV(fs.readFileSync('Notion exports/extracted_new/Languageflix v 1 0 1/All the Series/Series - Central c8741d14a2e34933a8ebcb05b612cb56_all.csv', 'utf8'));

// Count series available per language (either original or dubbed)
const langSeriesCount = {};
series.forEach(s => {
  const combined = (s['Original Language'] || '') + ', ' + (s['Dubbings'] || '') + ', ' + (s['Dubbings 2'] || '');
  if (/Français/i.test(combined)) langSeriesCount['French'] = (langSeriesCount['French'] || 0) + 1;
  if (/English/i.test(combined)) langSeriesCount['English'] = (langSeriesCount['English'] || 0) + 1;
  if (/Deutsch|Alemão/i.test(combined)) langSeriesCount['German'] = (langSeriesCount['German'] || 0) + 1;
  if (/Español|Espanhol/i.test(combined)) langSeriesCount['Spanish'] = (langSeriesCount['Spanish'] || 0) + 1;
  if (/Italiano/i.test(combined)) langSeriesCount['Italian'] = (langSeriesCount['Italian'] || 0) + 1;
  if (/Russian|Russo/i.test(combined)) langSeriesCount['Russian'] = (langSeriesCount['Russian'] || 0) + 1;
  if (/Japanese|Japonês/i.test(combined)) langSeriesCount['Japanese'] = (langSeriesCount['Japanese'] || 0) + 1;
  if (/Português/i.test(combined)) langSeriesCount['Portuguese (BR)'] = (langSeriesCount['Portuguese (BR)'] || 0) + 1;
  if (/Polish|Polonês/i.test(combined)) langSeriesCount['Polish'] = (langSeriesCount['Polish'] || 0) + 1;
  if (/Ukrainian|Ucraniano/i.test(combined)) langSeriesCount['Ukrainian'] = (langSeriesCount['Ukrainian'] || 0) + 1;
});

console.log('Series count per language:', langSeriesCount);
