const fs = require('fs');

async function testFetchChannel(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    console.log(url, '-> status:', res.status, 'og:image:', ogMatch ? ogMatch[1] : 'NOT FOUND');
  } catch(e) {
    console.log(url, 'error:', e.message);
  }
}

async function run() {
  await testFetchChannel('https://www.youtube.com/c/AstronoGeek');
  await testFetchChannel('https://www.youtube.com/c/aliabdaal/videos');
  await testFetchChannel('https://www.youtube.com/c/Kurzgesagt/videos');
  await testFetchChannel('https://www.youtube.com/@Kurzgesagt');
}
run();
