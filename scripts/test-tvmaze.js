const fs = require('fs');

async function testTvmaze(query) {
  try {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      console.log('TVMaze result for:', query);
      console.log('- Poster:', data.image?.medium || data.image?.original);
      console.log('- Summary:', data.summary?.replace(/<[^>]*>/g, '').trim().slice(0, 150));
      console.log('- Genres:', data.genres);
    } else {
      console.log('TVMaze failed for', query, res.status);
    }
  } catch(e) {
    console.error('TVMaze error:', e.message);
  }
}

async function run() {
  await testTvmaze('Dark');
  await testTvmaze('Stranger Things');
  await testTvmaze('Brooklyn Nine-Nine');
  await testTvmaze('La Casa de Papel');
  await testTvmaze('Biohackers');
}

run();
