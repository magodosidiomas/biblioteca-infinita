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

const dePath = 'Notion exports/extracted_new/Languageflix v 1 0 1/German/(DE) Content/Alemão Deutsch 9f3e092d7558410e92d0648ffad545c6_all.csv';
const de = parseCSV(fs.readFileSync(dePath, 'utf8'));
console.log('German rows parsed:', de.length);
console.log('Sample German row:', de[0]);
console.log('Sample German types:', [...new Set(de.map(d => d.Type))]);
console.log('Sample German subtitles:', [...new Set(de.map(d => d.Subtitles))]);
