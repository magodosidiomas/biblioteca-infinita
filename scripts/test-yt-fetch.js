const fs = require('fs');

async function testFetch() {
  const testUrls = [
    'https://www.youtube.com/channel/UCVgW9ZQaGBk6fsiPgE2mYDg',
    'https://www.youtube.com/@EasyFrench',
    'https://www.youtube.com/watch?v=gfF_Qgtms_U',
    'https://www.youtube.com/c/Kurzgesagt'
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await res.text();
      const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      console.log('URL:', url, '->', ogMatch ? ogMatch[1] : 'NOT FOUND');
    } catch(e) {
      console.error('Error fetching', url, e.message);
    }
  }
}

testFetch();
