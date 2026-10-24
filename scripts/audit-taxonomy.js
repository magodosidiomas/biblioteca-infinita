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

const allFiles = getAllFiles('Notion exports/extracted_new');
const contentCsvs = allFiles.filter(f => f.includes('Content') && f.endsWith('_all.csv'));

const allTags = new Set();
const allTypes = new Set();
const allSubtitles = new Set();

contentCsvs.forEach(csv => {
  const rows = parseCSV(fs.readFileSync(csv, 'utf8'));
  rows.forEach(r => {
    if (r.Type) allTypes.add(r.Type);
    if (r.Subtitles) allSubtitles.add(r.Subtitles);
    if (r.Tags) {
      r.Tags.split(',').forEach(t => allTags.add(t.trim()));
    }
  });
});

console.log('All Types in Content CSVs:');
console.log(Array.from(allTypes));
console.log('\nAll Subtitle tags:');
console.log(Array.from(allSubtitles));
console.log('\nSample Tags:');
console.log(Array.from(allTags).slice(0, 30));
