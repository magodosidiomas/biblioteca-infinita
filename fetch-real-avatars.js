const fs = require('fs');

async function getOg() {
  const urls = [
    { id: 'easy_french', url: 'https://www.youtube.com/@EasyFrench' },
    { id: 'piece_of_french', url: 'https://www.youtube.com/@PieceofFrench' },
    { id: 'wandering_french', url: 'https://www.youtube.com/@WanderingFrench' },
    { id: 'linguisticae', url: 'https://www.youtube.com/@Linguisticae' },
    { id: 'monde_langues', url: 'https://www.youtube.com/@lemondedeslangues' },
    { id: 'cyprien', url: 'https://www.youtube.com/@cyprien' },
    { id: 'guillaume_ruchon', url: 'https://www.youtube.com/@guiruch' },
    { id: 'nota_bene', url: 'https://www.youtube.com/@notabenemovies' },
    { id: 'trash', url: 'https://www.youtube.com/@trash' }
  ];

  const results = {};
  for (const item of urls) {
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      results[item.id] = m ? m[1] : null;
      console.log(item.id, '->', results[item.id]);
    } catch (e) {
      console.error(item.id, e.message);
    }
  }

  fs.writeFileSync('real-avatars.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('Salvo em real-avatars.json!');
}

getOg();
