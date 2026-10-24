const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const genericItems = [];

Object.entries(contentData).forEach(([lang, formats]) => {
  Object.entries(formats).forEach(([fmt, items]) => {
    items.forEach(item => {
      if (!item.desc || item.desc.includes('Conteúdo selecionado para imersão') || item.desc.includes('disponível com áudio em') || item.desc.includes('foco em conteúdo de alta qualidade')) {
        genericItems.push({
          lang,
          fmt,
          name: item.name,
          url: item.url,
          desc: item.desc,
          avatar: item.avatar
        });
      }
    });
  });
});

console.log('Total items with generic description:', genericItems.length);
const byFmt = {};
genericItems.forEach(i => byFmt[i.fmt] = (byFmt[i.fmt] || 0) + 1);
console.log('Generic descriptions by format:', byFmt);

console.log('\nSample generic items:');
genericItems.slice(0, 10).forEach(i => console.log(`[${i.lang} | ${i.fmt}] ${i.name} -> ${i.url || 'NO_URL'}`));
