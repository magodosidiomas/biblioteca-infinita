const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const stats = {
  total: 0,
  byFormat: {},
  genericDesc: 0,
  faviconAvatar: 0,
  missingAvatar: 0
};

Object.entries(contentData).forEach(([lang, formats]) => {
  Object.entries(formats).forEach(([fmt, items]) => {
    stats.byFormat[fmt] = (stats.byFormat[fmt] || 0) + items.length;
    items.forEach(item => {
      stats.total++;
      if (!item.desc || item.desc.includes('Conteúdo selecionado para imersão') || item.desc.includes('disponível com áudio em')) {
        stats.genericDesc++;
      }
      if (!item.avatar) {
        stats.missingAvatar++;
      } else if (item.avatar.includes('google.com/s2/favicons')) {
        stats.faviconAvatar++;
      }
    });
  });
});

console.log('--- CONTENT AUDIT ---');
console.log('Total items across all languages & formats:', stats.total);
console.log('Distribution by format:', stats.byFormat);
console.log('Items with generic description:', stats.genericDesc);
console.log('Items with Google favicon fallback avatar:', stats.faviconAvatar);
console.log('Items with completely missing avatar:', stats.missingAvatar);
