const fs = require('fs');

const contentData = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));

// 1. YouTube Channels
const ytChannels = new Map();
// 2. Podcasts
const podcastShows = new Map();
// 3. Series
const seriesShows = new Map();
// 4. Websites
const websites = new Map();

Object.entries(contentData).forEach(([lang, formats]) => {
  if (formats.YouTube) {
    formats.YouTube.forEach(item => {
      if (item.url && !ytChannels.has(item.url)) {
        ytChannels.set(item.url, { name: item.name, url: item.url, lang });
      }
    });
  }
  if (formats.Podcasts) {
    formats.Podcasts.forEach(item => {
      if (!podcastShows.has(item.name)) {
        podcastShows.set(item.name, { name: item.name, url: item.url, lang });
      }
    });
  }
  if (formats.Séries) {
    formats.Séries.forEach(item => {
      if (!seriesShows.has(item.name)) {
        seriesShows.set(item.name, { name: item.name, url: item.url, lang });
      }
    });
  }
  if (formats.Sites) {
    formats.Sites.forEach(item => {
      if (item.url && !websites.has(item.url)) {
        websites.set(item.url, { name: item.name, url: item.url, lang });
      }
    });
  }
});

console.log('Unique entities to enrich:');
console.log(`- YouTube Channels: ${ytChannels.size}`);
console.log(`- Podcasts: ${podcastShows.size}`);
console.log(`- Series: ${seriesShows.size}`);
console.log(`- Websites: ${websites.size}`);
