const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

Object.entries(contentData).forEach(([lang, formats]) => {
  ['Podcasts', 'Séries', 'Sites'].forEach(fmt => {
    const items = formats[fmt] || [];
    const favicons = items.filter(i => i.avatar && i.avatar.includes('google.com/s2/favicons')).length;
    console.log(`${lang} - ${fmt}: total=${items.length}, favicons=${favicons}`);
  });
});
