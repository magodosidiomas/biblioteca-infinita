const fs = require('fs');

const channels = [
  { id: "easy_french", name: "Easy French", url: "https://www.youtube.com/@EasyFrench" },
  { id: "piece_of_french", name: "Piece of French", url: "https://www.youtube.com/@PieceofFrench" },
  { id: "wandering_french", name: "Wandering French", url: "https://www.youtube.com/@WanderingFrench" },
  { id: "linguisticae", name: "Linguisticae", url: "https://www.youtube.com/@Linguisticae" },
  { id: "monde_langues", name: "Le Monde des Langues", url: "https://www.youtube.com/@lemondedeslangues" },
  { id: "cyprien", name: "Cyprien", url: "https://www.youtube.com/@cyprien" },
  { id: "guillaume_ruchon", name: "Guillaume Ruchon", url: "https://www.youtube.com/@guiruch" },
  { id: "nota_bene", name: "Nota Bene", url: "https://www.youtube.com/@notabenemovies" },
  { id: "trash", name: "Trash", url: "https://www.youtube.com/@trash" }
];

function decodeHtml(html) {
  return html
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchDescriptions() {
  const descriptions = {};
  for (const c of channels) {
    try {
      console.log(`Fetching ${c.name}...`);
      const res = await fetch(c.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      const html = await res.text();
      const ogDesc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
      const metaDesc = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
      const rawDesc = ogDesc || metaDesc || '';
      descriptions[c.id] = decodeHtml(rawDesc);
      console.log(`-> ${c.name}: ${descriptions[c.id].slice(0, 100)}...`);
    } catch (e) {
      console.error(`Failed ${c.name}:`, e.message);
    }
  }
  fs.writeFileSync('youtube-descriptions.json', JSON.stringify(descriptions, null, 2), 'utf-8');
  console.log('Saved youtube-descriptions.json successfully!');
}

fetchDescriptions();
