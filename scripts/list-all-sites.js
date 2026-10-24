const fs = require('fs');
const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const allSites = [];
Object.entries(contentData).forEach(([lang, formats]) => {
  if (formats.Sites) {
    formats.Sites.forEach(s => {
      allSites.push({ lang, name: s.name, url: s.url, tags: s.tags });
    });
  }
});

console.log('Total Sites:', allSites.length);
allSites.forEach((s, idx) => {
  console.log(`${(idx + 1).toString().padStart(2, ' ')}. [${s.lang}] "${s.name}" | tags: ${s.tags.join(', ')} | url: ${s.url}`);
});
