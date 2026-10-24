const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

const channelsToFetch = [];
const seenUrls = new Set();

Object.entries(contentData).forEach(([lang, data]) => {
  if (data.YouTube) {
    data.YouTube.forEach(ch => {
      if (ch.url && (ch.url.includes('youtube.com') || ch.url.includes('youtu.be'))) {
        if (!seenUrls.has(ch.url)) {
          seenUrls.add(ch.url);
          channelsToFetch.push({
            id: ch.id,
            name: ch.name,
            url: ch.url,
            currentAvatar: ch.avatar
          });
        }
      }
    });
  }
});

console.log('Total unique YouTube channels across all languages:', channelsToFetch.length);
const placeholders = channelsToFetch.filter(c => !c.currentAvatar || c.currentAvatar.includes('google.com/s2/favicons'));
console.log('Channels with favicon/placeholder avatar:', placeholders.length);
console.log('Sample channels needing real avatars:');
placeholders.slice(0, 5).forEach(c => console.log(`- ${c.name}: ${c.url}`));
