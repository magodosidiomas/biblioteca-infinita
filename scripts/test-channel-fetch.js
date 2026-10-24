const fs = require('fs');

async function testExtractChannel(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();
    // Check og:image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    if (ogMatch) {
      console.log('og:image matched for', url, ':', ogMatch[1]);
      return;
    }
    // Check yt3.googleusercontent.com in html
    const yt3Match = html.match(/(https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+)/);
    if (yt3Match) {
      console.log('yt3 image matched for', url, ':', yt3Match[1]);
      return;
    }
    console.log('No image matched for', url, 'status:', res.status, 'html len:', html.length);
  } catch(e) {
    console.error('Error for', url, e.message);
  }
}

async function run() {
  await testExtractChannel('https://www.youtube.com/c/Kurzgesagt');
  await testExtractChannel('https://www.youtube.com/c/screenjunkies/featured');
  await testExtractChannel('https://www.youtube.com/user/havic5');
}

run();
