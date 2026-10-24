const fs = require('fs');

async function testWikipedia(query) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      console.log('Wikipedia summary for:', query);
      console.log('- Extract:', data.extract?.slice(0, 150));
      console.log('- Thumbnail:', data.thumbnail?.source);
    } else {
      console.log('Wikipedia failed for:', query, res.status);
    }
  } catch(e) {
    console.error('Wiki error:', e.message);
  }
}

async function run() {
  await testWikipedia('Dark (TV series)');
  await testWikipedia('Peaky Blinders (TV series)');
}

run();
