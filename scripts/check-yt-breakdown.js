const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

Object.entries(contentData).forEach(([lang, formats]) => {
  const yt = formats.YouTube || [];
  const genericDesc = yt.filter(c => !c.desc || c.desc.includes('Conteúdo selecionado para imersão')).length;
  const favicon = yt.filter(c => c.avatar && c.avatar.includes('google.com/s2/favicons')).length;
  console.log(`${lang.padEnd(12)} -> YouTube: ${yt.length} | favicons: ${favicon} | generic desc: ${genericDesc}`);
});
