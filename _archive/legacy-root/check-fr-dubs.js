const fs = require('fs');

const lines = fs.readFileSync('Notion exports/extracted_new/Languageflix v 1 0 1/All the Series/Series - Central c8741d14a2e34933a8ebcb05b612cb56_all.csv', 'utf8').split('\n');

const dubsInFr = [];
lines.slice(1).forEach(l => {
  const parts = l.split(',');
  if (!parts[0]) return;
  const name = parts[0].replace(/^"|"$/g, '').trim();
  const dubs = (parts[2] || '') + (parts[3] || '');
  const orig = (parts[5] || '').trim();
  if (dubs.includes('Français') || dubs.includes('French')) {
    dubsInFr.push({ name, orig });
  }
});
console.log('Total shows with French dubbing in Notion:', dubsInFr.length);
dubsInFr.forEach(s => console.log('-', s.name, '| Orig:', s.orig));
