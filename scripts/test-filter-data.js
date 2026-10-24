const fs = require('fs');
const html = fs.readFileSync('preview.html', 'utf-8');

const regex = /<article data-format="([^"]+)" data-title="([^"]+)" data-theme="([^"]+)" data-sub="([^"]+)" data-pace="([^"]+)"/g;
let match;
const cards = [];
while ((match = regex.exec(html)) !== null) {
  cards.push({ format: match[1], title: match[2], theme: match[3], sub: match[4], pace: match[5] });
}
console.log('Total cards found in html:', cards.length);
console.log('Formats:', [...new Set(cards.map(c => c.format))]);
console.log('Subs:', [...new Set(cards.map(c => c.sub))]);
console.log('Paces:', [...new Set(cards.map(c => c.pace))]);
console.log('Themes:', [...new Set(cards.flatMap(c => c.theme.split(' ')))]);
