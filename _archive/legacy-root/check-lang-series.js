const fs = require('fs');

const lines = fs.readFileSync('Notion exports/extracted_new/Languageflix v 1 0 1/All the Series/Series - Central c8741d14a2e34933a8ebcb05b612cb56_all.csv', 'utf8').split('\n');

const langSeries = {};
lines.slice(1).forEach(l => {
  const parts = l.split(',');
  if (!parts[0]) return;
  const name = parts[0].replace(/^"|"$/g, '').trim();
  const orig = (parts[5] || '').trim();
  if (!langSeries[orig]) langSeries[orig] = [];
  langSeries[orig].push(name);
});

console.log('Original languages in Notion Series Central:');
Object.entries(langSeries).forEach(([lang, series]) => {
  console.log(lang, '->', series.length, 'séries:', series);
});
