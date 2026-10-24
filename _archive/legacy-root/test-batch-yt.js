const https = require('https');

function fetchYt(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(https:\/\/yt3\.googleusercontent\.com\/[^"]+)"/i);
        resolve({
          desc: descMatch ? descMatch[1] : null,
          avatar: avatarMatch ? avatarMatch[1] : null
        });
      });
    }).on('error', () => resolve({ desc: null, avatar: null }));
  });
}

(async () => {
  const channels = [
    'https://www.youtube.com/channel/UCAQg09FkoobmLquNNoO4ulg', // Linguamarina
    'https://www.youtube.com/c/SpeakEnglishWithTiffani/videos', // Speak English with Tiffani
    'https://www.youtube.com/user/twosetviolin', // TwoSetViolin
    'https://www.youtube.com/user/JordanPetersonVideos', // Jordan Peterson
    'https://www.youtube.com/c/jamieoliver/videos' // Jamie Oliver
  ];
  for (const c of channels) {
    const res = await fetchYt(c);
    console.log(c, '->', res.desc ? res.desc.slice(0, 90) : 'NO DESC');
  }
})();
