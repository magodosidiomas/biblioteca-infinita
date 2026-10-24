const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const podcastRealData = JSON.parse(fs.readFileSync('podcasts-real-data.json', 'utf8'));
const sitesCuratedData = JSON.parse(fs.readFileSync('sites-curated-data.json', 'utf8'));

let pCount = 0;
let sCount = 0;

Object.entries(contentData).forEach(([lang, formats]) => {
  // 1. Podcasts
  if (formats.Podcasts) {
    formats.Podcasts.forEach(p => {
      const real = podcastRealData[p.name];
      if (real) {
        if (real.desc && real.desc.length > 25) {
          p.desc = real.desc;
          pCount++;
        }
        if (real.artist && (!p.creator || p.creator === '')) {
          p.creator = real.artist;
        }
        if (real.artwork && (!p.avatar || p.avatar.includes('google.com/s2/favicons'))) {
          p.avatar = real.artwork;
        }
      }
    });
  }

  // 2. Sites
  if (formats.Sites) {
    formats.Sites.forEach(s => {
      const curated = sitesCuratedData[s.name];
      if (curated) {
        if (curated.desc) {
          s.desc = curated.desc;
          sCount++;
        }
        if (curated.avatar && (!s.avatar || s.avatar.includes('google.com/s2/favicons'))) {
          s.avatar = curated.avatar;
        }
      }
    });
  }
});

fs.writeFileSync('app/src/data/content.json', JSON.stringify(contentData, null, 2), 'utf8');

console.log('Final Application Complete:');
console.log(`- Podcasts with unique RSS descriptions: ${pCount}`);
console.log(`- Sites with unique SEO/curated descriptions: ${sCount}`);
