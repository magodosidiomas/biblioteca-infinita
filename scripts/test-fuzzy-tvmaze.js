const fs = require('fs');

async function testTvmazeSearch(query) {
  try {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const results = await res.json();
      if (results.length > 0) {
        const show = results[0].show;
        console.log(`[TVMaze search] "${query}" -> Found: "${show.name}"`);
        console.log('  poster:', show.image?.medium);
        console.log('  summary:', show.summary?.replace(/<[^>]*>/g, '').trim().slice(0, 100));
        return show;
      }
    }
  } catch(e) {
    console.error(e.message);
  }
}

async function run() {
  await testTvmazeSearch('Sherlock Holmes');
  await testTvmazeSearch('Ursos Sem Curso'); // We Bare Bears
  await testTvmazeSearch('Explained Our Brain Mind');
  await testTvmazeSearch('Il Processo');
}

run();
