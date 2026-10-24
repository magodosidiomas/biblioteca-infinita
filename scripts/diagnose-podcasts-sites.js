const fs = require('fs');
const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

console.log('=== PODCASTS AUDIT ===');
const podcastMap = new Map();
Object.entries(contentData).forEach(([lang, data]) => {
  if (data.Podcasts) {
    data.Podcasts.forEach(p => {
      if (!podcastMap.has(p.name)) {
        podcastMap.set(p.name, { lang, name: p.name, url: p.url, desc: p.desc, avatar: p.avatar });
      }
    });
  }
});

console.log('Total unique podcasts:', podcastMap.size);
Array.from(podcastMap.values()).slice(0, 15).forEach(p => {
  console.log(`[${p.lang}] ${p.name}`);
  console.log(`  url:  ${p.url}`);
  console.log(`  desc: ${p.desc}`);
  console.log(`  img:  ${p.avatar?.slice(0, 60)}`);
});

console.log('\n=== SITES AUDIT ===');
const siteMap = new Map();
Object.entries(contentData).forEach(([lang, data]) => {
  if (data.Sites) {
    data.Sites.forEach(s => {
      if (!siteMap.has(s.name)) {
        siteMap.set(s.name, { lang, name: s.name, url: s.url, desc: s.desc, avatar: s.avatar });
      }
    });
  }
});

console.log('Total unique sites:', siteMap.size);
Array.from(siteMap.values()).slice(0, 15).forEach(s => {
  console.log(`[${s.lang}] ${s.name}`);
  console.log(`  url:  ${s.url}`);
  console.log(`  desc: ${s.desc}`);
  console.log(`  img:  ${s.avatar?.slice(0, 60)}`);
});
