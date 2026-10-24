const https = require('https');

function fetchYtData(url) {
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
  const testUrls = [
    'https://www.youtube.com/c/MattDAvella/videos',
    'https://www.youtube.com/user/gordonramsay/videos',
    'https://www.youtube.com/c/CharlesCornellStudios/videos',
    'https://www.youtube.com/@EnglishwithLucy'
  ];
  for (const u of testUrls) {
    const res = await fetchYtData(u);
    console.log(u);
    console.log('  Desc:', res.desc ? res.desc.slice(0, 100) : 'NONE');
    console.log('  Avatar FULL:', res.avatar);
  }
})();
