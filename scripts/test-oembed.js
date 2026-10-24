const fs = require('fs');

async function testOembed() {
  const urls = [
    'https://www.youtube.com/watch?v=gfF_Qgtms_U',
    'https://www.youtube.com/channel/UCVgW9ZQaGBk6fsiPgE2mYDg',
    'https://www.youtube.com/c/Kurzgesagt',
    'https://www.youtube.com/@Kurzgesagt'
  ];

  for (const u of urls) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const json = await res.json();
        console.log('oEmbed for', u, ':', json.thumbnail_url, '| author:', json.author_name);
      } else {
        console.log('oEmbed failed for', u, res.status);
      }
    } catch(e) {
      console.log('oEmbed error', u, e.message);
    }
  }
}

testOembed();
