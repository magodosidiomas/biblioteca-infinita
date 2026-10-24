const fs = require('fs');

async function searchTvmaze(query) {
  try {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        name: data.name,
        desc: data.summary ? data.summary.replace(/<[^>]*>/g, '').trim() : null,
        avatar: data.image?.original || data.image?.medium || null
      };
    }
  } catch (e) {
    console.error('Fetch error:', query, e.message);
  }
  return null;
}

const targets = [
  { key: 'Jurassic World: New Adventures', query: 'Jurassic World Camp Cretaceous' },
  { key: 'Trolljäger: Geschichten aus Arcadia – Netflix', query: 'Trollhunters' },
  { key: 'Wizards - Tales from Arcadia', query: 'Wizards: Tales of Arcadia' },
  { key: '3 Below: Tales from Arcadia', query: '3Below: Tales of Arcadia' },
  { key: 'Omnipresent', query: 'Omniscient' }, // Onisciente (Netflix Brazil)
  { key: 'Explained: Our Brain/Mind', query: 'The Mind, Explained' },
  { key: 'Avatar: The Legend of Korra', query: 'The Legend of Korra' },
  { key: 'Avatar: The Legend of Aang', query: 'Avatar: The Last Airbender' }
];

async function run() {
  const results = {};
  for (const t of targets) {
    const data = await searchTvmaze(t.query);
    console.log(t.key, '->', data ? `${data.name} (hasDesc: ${!!data.desc}, hasAvatar: ${!!data.avatar})` : 'NOT FOUND');
    results[t.key] = data;
  }
  fs.writeFileSync('series-fixes.json', JSON.stringify(results, null, 2), 'utf8');
}

run();
