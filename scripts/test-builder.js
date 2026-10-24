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

// Language definitions
const LANG_CONFIG = [
  { id: "french", name: "Francês", flag: "🇫🇷", folder: "French", pattern: /Français|French/i },
  { id: "russian", name: "Russo", flag: "🇷🇺", folder: "Russian", pattern: /Russian|Russo/i },
  { id: "english", name: "Inglês", flag: "🇬🇧", folder: "English", pattern: /English/i },
  { id: "german", name: "Alemão", flag: "🇩🇪", folder: "German", pattern: /Deutsch|Alemão|German/i },
  { id: "italian", name: "Italiano", flag: "🇮🇹", folder: "Italian", pattern: /Italiano|Italian/i },
  { id: "spanish", name: "Espanhol", flag: "🇪🇸", folder: "Spanish", pattern: /Español|Spanish/i },
  { id: "japanese", name: "Japonês", flag: "🇯🇵", folder: "Japanese", pattern: /Japanese|Japonês/i },
  { id: "portuguese", name: "Português", flag: "🇧🇷", folder: "Portuguese (BR)", pattern: /Português/i },
  { id: "polish", name: "Polonês", flag: "🇵🇱", folder: "Polish", pattern: /Polonês|Polish/i },
  { id: "ukrainian", name: "Ucraniano", flag: "🇺🇦", folder: "Ukrainian", pattern: /Ucraniano|Ukrainian/i },
  { id: "arabic", name: "Árabe", flag: "🇸🇦", folder: "Arabic", pattern: /Árabe|Arabic/i },
  { id: "latin", name: "Latim", flag: "🏛️", folder: "Latin", pattern: /Latin|Lingva/i }
];

console.log('Language mappings defined:', LANG_CONFIG.length);
