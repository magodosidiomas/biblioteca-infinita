const fs = require('fs');

// 9 canais reais 100% em Francês da sua base
const frenchChannels = [
  { name: "Easy French", url: "https://www.youtube.com/@EasyFrench" },
  { name: "Piece of French", url: "https://www.youtube.com/@PieceofFrench" },
  { name: "Wandering French", url: "https://www.youtube.com/@WanderingFrench" },
  { name: "Linguisticae", url: "https://www.youtube.com/@Linguisticae" },
  { name: "Le Monde des Langues", url: "https://www.youtube.com/@lemondedeslangues" },
  { name: "Cyprien", url: "https://www.youtube.com/@cyprien" },
  { name: "Guillaume Ruchon", url: "https://www.youtube.com/@guiruch" },
  { name: "Nota Bene", url: "https://www.youtube.com/@notabenemovies" },
  { name: "Trash", url: "https://www.youtube.com/@trash" }
];

async function scrapeFrench() {
  console.log("Raspando 9 canais em Francês...");
  const results = [];

  for (const item of frenchChannels) {
    try {
      console.log(`Buscando ${item.name}...`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: AbortSignal.timeout(6000)
      });
      const html = await res.text();

      const avatar = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
      
      let title = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || [])[1] || item.name;
      title = title.replace(/\s*-\s*YouTube/i, '').trim();

      let desc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                  html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

      results.push({
        name: title,
        url: item.url,
        avatar: avatar || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
        description: desc.trim() || 'Chaîne officielle dédiée à l\'apprentissage et à l\'immersion en français.'
      });
    } catch(err) {
      console.error(`Erro em ${item.name}:`, err.message);
      results.push({
        name: item.name,
        url: item.url,
        avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
        description: 'Vidéos authentiques pour pratiquer la compréhension orale du français.'
      });
    }
  }

  // Gera o HTML com bordas perfeitamente conectadas tanto horizontal quanto verticalmente
  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Francês (YouTube)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #09090b;
      color: #fafafa;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-12 selection:bg-purple-900 selection:text-white">

  <div class="max-w-6xl mx-auto space-y-8">

    <!-- CABEÇALHO COM IDIOMA ESPECÍFICO -->
    <div class="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-sm">🧙🏻‍♂️</span>
          <span class="text-xs font-semibold text-zinc-400">Biblioteca de Imersão</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-100">
          Canais em Francês
        </h1>
        <p class="text-xs text-zinc-400 mt-1">
          Página dedicada ao Francês (YouTube). Grade conectada com 9 canais reais.
        </p>
      </div>

      <div class="text-xs text-zinc-500 font-medium">
        9 canais curados
      </div>
    </div>

    <!-- GRADE CONECTADA PERFEITA: BORDAS VERTICAIS E HORIZONTAIS DE 1PX -->
    <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${results.map((c, idx) => {
        // Classes de borda cirúrgicas para formar a malha perfeita de 1px
        const borderBottom = idx < 6 ? 'border-b border-zinc-800' : '';
        const borderRight = (idx % 3 !== 2) ? 'lg:border-r lg:border-zinc-800' : '';
        const borderRightMd = (idx % 2 === 0) ? 'md:border-r md:border-zinc-800' : '';
        
        return `
          <a href="${c.url}" target="_blank" class="group block p-6 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between space-y-4 border-b border-zinc-800 md:border-b-0 ${idx < results.length - (results.length % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < results.length - (results.length % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
            <div class="space-y-4">
              
              <!-- 1. ÍCONE (Avatar oficial do canal) -->
              <div class="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                <img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover">
              </div>

              <!-- 2. NOME & 3. DESCRIÇÃO DO CANAL -->
              <div class="space-y-1.5">
                <h2 class="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                  ${c.name}
                </h2>
                <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  ${c.description}
                </p>
              </div>

            </div>
          </a>
        `;
      }).join('')}
    </div>

  </div>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("Arquivo atualizado com sucesso: preview.html");
}

scrapeFrench();
